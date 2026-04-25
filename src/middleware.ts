import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { NextResponse } from "next/server";

import type { UserRole } from "@prisma/client";

// Tworzymy edge-compatible instancję Auth.js
// TYLKO z authConfig — bez adaptera, bez bcrypt
const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register"];

const ROLE_PROTECTED_ROUTES: Record<string, UserRole[]> = {
  "/admin": ["ADMIN"],
};

export default auth(function middleware(req) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // req.auth jest dostępne dzięki authorized callback w authConfig
  const session = req.auth;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute && session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (!isPublicRoute && !session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sprawdzamy role
  for (const [route, allowedRoles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (pathname.startsWith(route) && session?.user) {
      const userRole = session.user.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
