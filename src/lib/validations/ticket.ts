import { z } from "zod";
import { TicketPriority } from "@prisma/client";

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must be less than 150 characters")
    .trim(),

  description: z
    .string()
    .min(1, "Description is required")
    .min(20, "Please provide more detail (at least 20 characters)")
    .max(5000, "Description must be less than 5000 characters")
    .trim(),

  priority: z.nativeEnum(TicketPriority),

  categoryId: z.string().cuid("Invalid category").optional().or(z.literal("")), // select z pustą wartością
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(150).trim().optional(),
  description: z.string().min(20).max(5000).trim().optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  categoryId: z.string().cuid().optional().nullable(),
  assignedToId: z.string().cuid().optional().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
