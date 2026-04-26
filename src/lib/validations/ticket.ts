import { z } from "zod";

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

  // z.enum wymaga tuple — użyj "as const" żeby TypeScript wiedział że to readonly tuple
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const, {
    error: "Please select a valid priority",
  }),

  categoryId: z.string().optional().nullable().or(z.literal("")),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(150).trim().optional(),
  description: z.string().min(20).max(5000).trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).optional(),
  categoryId: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
