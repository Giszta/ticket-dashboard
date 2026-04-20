import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign In — SupportDesk",
};

export default async function LoginPage() {
  // Jeśli user jest już zalogowany, przekieruj na dashboard
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
      </div>
      <LoginForm />
    </>
  );
}
