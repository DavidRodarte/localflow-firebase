import { z } from "zod";

export const AuthFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthForm = z.infer<typeof AuthFormSchema>;

export type AuthFormState = {
  message?: string;
};
