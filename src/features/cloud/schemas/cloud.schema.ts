import { z } from "zod";

export const cloudFormSchema = z.object({
  name: z.string().trim().min(1, "Cloud configuration name is required."),
  provider: z.string().min(1, "Cloud provider is required."),
  region: z.string().trim().optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean(),
});

export type CloudFormValues = z.infer<typeof cloudFormSchema>;
