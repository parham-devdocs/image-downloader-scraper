import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),
  userId: z
    .string()
    .min(3, "User ID must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});
