import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Required" }),
});

export type SignInSchema = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, { message: "Required" }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Minimum of 8 characters required" }),
});

export type SignUpSchema = z.infer<typeof SignUpSchema>;
