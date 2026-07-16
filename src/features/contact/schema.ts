import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  serviceInterest: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["en", "fr", "es"]),
});

export type ContactInput = z.infer<typeof contactSchema>;
