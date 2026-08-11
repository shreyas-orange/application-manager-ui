import { z } from "zod";

function nameField(fieldName: string) {
  return z
    .string()
    .trim()
    .min(2, `${fieldName} must be between 2 and 50 characters.`)
    .max(50, `${fieldName} must be between 2 and 50 characters.`)
    .regex(
      /^[A-Za-z\s'-]+$/,
      `${fieldName} can only contain letters, spaces, hyphens, and apostrophes.`,
    );
}

export const inviteUserSchema = z.object({
  first_name: nameField("First name"),
  last_name: nameField("Last name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  role_id: z.coerce
    .number({ message: "Please select a valid role." })
    .int()
    .positive("Please select a valid role."),
});

// role_id is coerced from the <select>'s string value to a number, so the
// form's raw input shape (string) differs from its validated output shape
// (number) — RHF needs both to type the form correctly.
export type InviteUserFormInput = z.input<typeof inviteUserSchema>;
export type InviteUserFormValues = z.output<typeof inviteUserSchema>;

export const editUserSchema = z.object({
  first_name: nameField("First name"),
  last_name: nameField("Last name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  is_active: z.boolean(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;
