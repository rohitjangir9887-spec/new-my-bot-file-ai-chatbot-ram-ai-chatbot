import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import { z } from 'zod';
import { generateImageServer } from '@/lib/chat/image-gen.server';

export const Route = createFileRoute('/api/image')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Image generation is currently unavailable.' }), { status: 401 });
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.slice(7));
        if (!user) return new Response(JSON.stringify({ error: 'Image generation is currently unavailable.' }), { status: 401 });
        try {
          const body = z.object({ prompt: z.string().min(1).max(4000), aspectRatio: z.enum(['1:1', '16:9', '9:16']).default('1:1'), conversationId: z.string().uuid() }).parse(await request.json());
          const result = await generateImageServer(body.prompt, body.aspectRatio, body.conversationId);
          const attachment = { id: result.fileId, name: 'Generated image', type: 'image', mimeType: result.mimeType, size: result.sizeBytes, url: result.url, storagePath: result.storagePath, status: 'ready' };
          const { data: message, error } = await supabaseAdmin.from('messages').insert({ conversation_id: body.conversationId, role: 'assistant', content: `I've generated this image based on your request: "${body.prompt.trim()}"`, metadata: { model: process.env.LOVABLE_IMAGE_MODEL?.trim() || 'dall-e-3', imagePrompt: body.prompt.trim(), status: 'completed', attachments: [attachment] }, attachments: [attachment] }).select('id').single();
          if (error || !message) return new Response(JSON.stringify({ error: 'Image generation is currently unavailable.' }), { status: 500 });
          return new Response(JSON.stringify({ ...result, messageId: message.id, attachment }), { headers: { 'Content-Type': 'application/json' } });
        } catch {
          return new Response(JSON.stringify({ error: 'Image generation is currently unavailable.' }), { status: 400 });
        }
      },
    },
  },
});
