import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  // Strony — definiujemy własne
  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Sesja JWT — edge-compatible
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  // Providers — PUSTY w edge config.
  // Credentials provider używa bcrypt — nie działa w Edge.
  // Dodamy go tylko w pełnej konfiguracji (index.ts).
  providers: [],

  callbacks: {
    // Ten callback jest edge-compatible — operuje tylko na JWT (plain object)
    // Używany przez middleware do sprawdzenia czy user jest zalogowany
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },

    // Authorized callback — używany TYLKO przez middleware
    // Decyduje czy request jest autoryzowany na poziomie routing
    authorized({ auth }) {
      // Zwracamy true jeśli user ma sesję — resztę obsługuje middleware
      return !!auth?.user;
    },
  },
};
