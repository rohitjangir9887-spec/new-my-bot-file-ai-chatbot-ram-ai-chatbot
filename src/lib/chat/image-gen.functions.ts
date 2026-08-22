import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateImageServer } from "./image-gen.server";

export const generateImage = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    prompt: z.string().min(1),
    aspectRatio: z.enum(['1:1', '16:9', '9:16']).default('1:1'),
    conversationId: z.string().uuid().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    return generateImageServer(data.prompt, data.aspectRatio, data.conversationId);
  });
