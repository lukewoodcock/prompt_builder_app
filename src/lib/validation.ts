import { z } from "zod";

/** Request body schema for POST /api/run. */
export const runRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required."),
  prefill: z.string().optional().default(""),
  model: z.string().optional(),
});

export type RunRequest = z.infer<typeof runRequestSchema>;
