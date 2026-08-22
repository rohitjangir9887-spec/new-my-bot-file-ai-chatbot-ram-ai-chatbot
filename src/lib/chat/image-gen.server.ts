import { z } from "zod";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server-side image generation using Lovable AI Gateway
 */
export async function generateImageServer(
  prompt: string, 
  aspectRatio: '1:1' | '16:9' | '9:16' = '1:1',
  conversationId?: string
) {
  const request = getRequest();
  if (!request) throw new Error("No request context");

  // 1. Authenticate
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) throw new Error("Unauthorized");

  // 2. AI Gateway Image Generation
  const apiKey = process.env['LOVABLE_AI_API_KEY'];
  if (!apiKey) {
    throw new Error("IMAGE_GENERATION_NOT_CONFIGURED");
  }

  try {
    const aiResponse = await fetch("https://api.lovable.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        model: "dall-e-3",
        n: 1,
        size: aspectRatio === '1:1' ? "1024x1024" : aspectRatio === '16:9' ? "1792x1024" : "1024x1792",
        response_format: "b64_json"
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({}));
      console.error("AI Gateway Image Error:", errorData);
      throw new Error("AI Gateway failed to generate image");
    }

    const result = await aiResponse.json();
    const b64Data = result.data[0].b64_json;
    if (!b64Data) throw new Error("No image data received");

    // 3. Store in Supabase
    const buffer = Buffer.from(b64Data, 'base64');
    const fileName = `${user.id}/${crypto.randomUUID()}.webp`;
    const storagePath = `generated/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('user-files')
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error("Failed to store generated image");
    }

    // 4. Record in user_files table for RLS
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('user_files')
      .insert({
        user_id: user.id,
        filename: `Generated: ${prompt.slice(0, 30)}...`,
        storage_path: storagePath,
        mime_type: 'image/webp',
        size_bytes: buffer.length
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB record error:", dbError);
    }

    // 5. Get signed URL for the client
    const { data: signedUrlData } = await supabaseAdmin.storage
      .from('user-files')
      .createSignedUrl(storagePath, 3600); // 1 hour

    return {
      success: true,
      url: signedUrlData?.signedUrl,
      storagePath,
      prompt
    };

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
}
