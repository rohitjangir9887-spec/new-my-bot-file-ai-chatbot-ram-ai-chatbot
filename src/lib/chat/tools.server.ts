import { z } from 'zod';

export const CalculatorSchema = z.object({
  expression: z.string(),
});

export const WebSearchSchema = z.object({
  query: z.string(),
});

export const ImageGenSchema = z.object({
  prompt: z.string(),
  aspectRatio: z.enum(['1:1', '16:9', '9:16']).default('1:1'),
});

export const ToolSchema = z.union([
  z.object({ type: z.literal('calculator'), args: CalculatorSchema }),
  z.object({ type: z.literal('web_search'), args: WebSearchSchema }),
  z.object({ type: z.literal('generate_image'), args: ImageGenSchema }),
]);

export type ToolType = 'calculator' | 'web_search' | 'generate_image';

export async function executeTool(type: ToolType, args: any) {
  switch (type) {
    case 'calculator':
      try {
        if (/[^0-9+\-*/(). ]/.test(args.expression)) {
          throw new Error("Forbidden characters in expression");
        }
        const result = new Function(`return ${args.expression}`)();
        
        if (typeof result !== 'number' || !isFinite(result)) {
          throw new Error("Invalid result");
        }
        
        return { result: String(result) };
      } catch (e) {
        throw new Error("Invalid mathematical expression");
      }
    case 'web_search':
      // Architecture placeholder. Implementation requires API key.
      return { 
        results: [], 
        error: "Web search provider not configured." 
      };
    case 'generate_image':
      // The actual generation is handled by the dedicated server function
      // but we register the tool schema here for the AI Gateway.
      return {
        message: "Image generation tool called. Processing..."
      };
    default:
      throw new Error("Unknown tool");
  }
}
