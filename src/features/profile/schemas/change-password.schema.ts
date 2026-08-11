import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required."),

    new_password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    confirm_password: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((values) => values.current_password !== values.new_password, {
    message: "New password must be different from your current password",
    path: ["new_password"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
