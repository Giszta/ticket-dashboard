"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false, // obsługujemy redirect ręcznie
    });

    if (result?.error) {
      setServerError("Invalid email or password. Please try again.");
      return;
    }

    // Sukces — przekieruj na dashboard
    router.push("/");
    router.refresh(); // odświeżamy Server Components żeby załadowały nową sesję
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        required
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        required
        {...register("password")}
      />

      {/* Błąd serwera */}
      {serverError && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Sign in
      </Button>

      {/* Demo credentials helper */}
      <div className="rounded-md bg-blue-50 px-4 py-3">
        <p className="mb-2 text-xs font-medium text-blue-800">Demo credentials:</p>
        <div className="space-y-1 text-xs text-blue-700">
          <p>Admin: admin@example.com / admin123</p>
          <p>Agent: agent1@example.com / agent123</p>
          <p>Customer: customer1@example.com / customer123</p>
        </div>
      </div>
    </form>
  );
}
