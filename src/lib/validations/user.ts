import { z } from "zod";
import { UserRole } from "@prisma/client";

export const changeRoleSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z.nativeEnum(UserRole),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
