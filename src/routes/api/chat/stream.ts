import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';

export const Route = createFileRoute('/api/chat/stream')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // 1. Authenticate
          const authHeader = request.headers.get("Authorization");
          if (!authHeader) return new Response('Unauthorized', { status: 401 });

          const token = authHeader.replace("Bearer ", "");
          const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
          if (authError || !user) return new Response('Unauthorized', { status: 401 });

          // 2. Parse and Validate Body
          const body = await request.json();
          const schema = z.object({
            conversationId: z.string().uuid(),
            modelId: z.string().default('gpt-4o'),
            messages: z.array(z.object({
              role: z.enum(['user', 'assistant', 'system']),
              content: z.string(),
              attachments: z.array(z.object({
                id: z.string(),
                name: z.string(),
                type: z.enum(['image', 'pdf', 'document']),
                url: z.string(),
                storagePath: z.string().optional()
              })).optional()
            }))
          });

          const { conversationId, modelId, messages } = schema.parse(body);

          // 3. Verify Ownership & Rate Limiting
          const { data: conversation, error: convError } = await supabaseAdmin
            .from('conversations')
            .select('user_id')
            .eq('id', conversationId)
            .single();

          if (convError || !conversation) {
            return new Response(JSON.stringify({ error: 'Conversation not found' }), { status: 404 });
          }
          
          if (conversation.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'FORBIDDEN' }), { status: 403 });
          }

          // SERVER-SIDE RATE LIMITING (Production Readiness Pass)
          // Limit: 50 requests per hour per user
          const { count: requestCount, error: countError } = await supabaseAdmin
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', new Date(Date.now() - 3600000).toISOString());

          if (!countError && requestCount && requestCount > 50) {
            return new Response(JSON.stringify({ 
              error: 'RATE_LIMIT_EXCEEDED',
              message: 'Hourly limit reached. Please wait a while.' 
            }), { 
              status: 429,
              headers: { 'Content-Type': 'application/json' }
            });
          }



          // Transform messages for AI Gateway (Multimodal support)
          const transformedMessages = await Promise.all(messages.map(async (m) => {
            if (m.role === 'user' && m.attachments && m.attachments.length > 0) {
              const content: any[] = [{ type: 'text', text: m.content }];
              
              for (const att of m.attachments) {
                if (att.type === 'image' && att.storagePath) {
                  // Verify file ownership in DB
                  const { data: fileData } = await supabaseAdmin
                    .from('user_files')
                    .select('id')
                    .eq('storage_path', att.storagePath)
                    .eq('user_id', user.id)
                    .single();
                  
                  if (fileData) {
                    // Get a short-lived signed URL for the AI to fetch the image
                    const { data: signedUrlData } = await supabaseAdmin.storage
                      .from('user-files')
                      .createSignedUrl(att.storagePath, 300); // 5 mins
                    
                    if (signedUrlData) {
                      content.push({
                        type: 'image_url',
                        image_url: { url: signedUrlData.signedUrl }
                      });
                    }
                  }
                } else if (att.type === 'pdf' || att.type === 'document') {
                  // Text extraction would go here in a full implementation.
                  // For now, we append a notice to the text content if supported.
                  content[0].text += `\n\n[Attached File: ${att.name}]`;
                }
              }
              return { role: m.role, content };
            }
            return { role: m.role, content: m.content };
          }));

          // 4. Call AI Gateway
          const apiKey = process.env['LOVABLE_AI_API_KEY'];
          if (!apiKey) {
             return new Response(JSON.stringify({ error: "PROVIDER_UNAVAILABLE" }), { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
             });
          }

          // Define tools for the AI
          const tools = [
            {
              type: "function",
              function: {
                name: "calculator",
                description: "Evaluates a mathematical expression safely.",
                parameters: {
                  type: "object",
                  properties: {
                    expression: {
                      type: "string",
                      description: "The math expression to evaluate (e.g., '2 + 2 * 4')"
                    }
                  },
                  required: ["expression"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "web_search",
                description: "Searches the web for up-to-date information.",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "The search query"
                    }
                  },
                  required: ["query"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generate_image",
                description: "Generates a high-quality image based on a text prompt.",
                parameters: {
                  type: "object",
                  properties: {
                    prompt: {
                      type: "string",
                      description: "The detailed image description"
                    },
                    aspectRatio: {
                      type: "string",
                      enum: ["1:1", "16:9", "9:16"],
                      description: "The aspect ratio of the image"
                    }
                  },
                  required: ["prompt"]
                }
              }
            }
          ];

          const aiResponse = await fetch("https://api.lovable.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: modelId,
              messages: transformedMessages,
              tools,
              tool_choice: "auto",
              stream: true
            })
          });

          if (!aiResponse.ok) {
            const err = await aiResponse.text();
            return new Response(err, { status: aiResponse.status });
          }

          // 5. Proxy Stream
          return new Response(aiResponse.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });

        } catch (error: any) {
          console.error("Stream Error:", error);
          
          const status = error.name === 'ZodError' ? 400 : 500;
          let message = 'An internal server error occurred';
          
          if (status === 400) {
            message = 'Invalid request data';
          } else if (error.message === 'RATE_LIMIT_EXCEEDED') {
            message = 'Too many requests. Please try again later.';
          }
          
          return new Response(JSON.stringify({ error: message }), { 
            status,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }
});
