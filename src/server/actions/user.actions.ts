"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { userRepository } from "@/server/repositories/user.repository";
import { changeRoleSchema } from "@/lib/validations/user";
import { UserRole } from "@prisma/client";
import type { ActionResult } from "@/types";

export async function changeUserRoleAction(
  userId: string,
  newRole: UserRole,
): Promise<ActionResult> {
  // 1. Auth check
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Tylko Admin może zmieniać role
  if (session.user.role !== "ADMIN") {
    return { success: false, error: "Only admins can change user roles" };
  }

  // 3. Admin nie może zmienić swojej własnej roli
  // (zabezpieczenie przed accidental lockout)
  if (session.user.id === userId) {
    return { success: false, error: "You cannot change your own role" };
  }

  // 4. Walidacja danych
  const parsed = changeRoleSchema.safeParse({ userId, role: newRole });
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  // 5. Sprawdź że user istnieje
  const user = await userRepository.findById(userId);
  if (!user) {
    return { success: false, error: "User not found" };
  }

  // 6. Nie zmieniaj jeśli rola jest ta sama
  if (user.role === newRole) {
    return { success: true, data: undefined };
  }

  try {
    await userRepository.updateRole(userId, newRole);
    revalidatePath("/admin/users");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to change user role:", error);
    return { success: false, error: "Failed to update role. Please try again." };
  }
}
