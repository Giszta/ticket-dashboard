import { UserRole } from "@prisma/client";
import { DefaultSession, DefaultJWT } from "next-auth";

// Rozszerzamy moduł "next-auth" — augmentacja modułów TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    avatarUrl?: string | null;
  }
}

// Rozszerzamy typ JWT
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    avatarUrl?: string | null;
  }
}
