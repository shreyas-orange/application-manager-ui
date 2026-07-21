import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(
        /[A-Z]/,
        "Password must contain at least one uppercase letter",
      )
      .regex(
        /[a-z]/,
        "Password must contain at least one lowercase letter",
      )
      .regex(
        /[0-9]/,
        "Password must contain at least one number",
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),

    confirm_password: z.string().min(1, "Confirm your password"),
  })
  .refine(
    (values) => values.password === values.confirm_password,
    {
      message: "Passwords do not match",
      path: ["confirm_password"],
    },
  );

export type RegisterFormValues = z.infer<
  typeof registerSchema
>;