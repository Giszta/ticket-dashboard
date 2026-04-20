import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/server/db/client";
import { loginSchema } from "@/lib/validations/auth";
import { UserRole } from "../../../src/generated/prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Adapter przechowuje sesje w bazie danych przez Prismę
  adapter: PrismaAdapter(db),

  // Strategia sesji: "jwt" zamiast "database" dla credentials provider.
  // Auth.js wymaga JWT gdy używasz credentials — sesje bazodanowe
  // działają tylko z OAuth providerami.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dni
  },

  // Strony — definiujemy własne, nie domyślne Auth.js
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      // credentials definiuje pola formularza (używane przez Auth.js UI, my mamy własne)
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 1. Walidujemy dane wejściowe Zodem
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Szukamy użytkownika w bazie
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            avatarUrl: true,
          },
        });

        // 3. Użytkownik nie istnieje
        if (!user || !user.password) return null;

        // 4. Sprawdzamy hasło
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        // 5. Zwracamy obiekt user — trafi do JWT token
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback — wywoływany przy tworzeniu i odświeżaniu tokenu
    // Tu przenosimy dodatkowe dane z user do tokenu
    async jwt({ token, user }) {
      if (user) {
        // "user" istnieje tylko przy pierwszym logowaniu
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },

    // session callback — wywoływany gdy klient pyta o sesję
    // Tu przenosimy dane z tokenu do obiektu session dostępnego po stronie klienta
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
  },
});
