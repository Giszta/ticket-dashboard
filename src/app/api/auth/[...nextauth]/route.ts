import { handlers } from "@/lib/auth";

// Auth.js v5 eksportuje gotowe handlery GET i POST
// Catch-all route obsługuje wszystkie endpointy Auth.js:
// /api/auth/signin, /api/auth/signout, /api/auth/session, /api/auth/callback/...
export const { GET, POST } = handlers;
