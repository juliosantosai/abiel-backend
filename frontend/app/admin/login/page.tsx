"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";

const loginSchema = z.object({
  apiKey: z.string().min(10, "La API key es requerida")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { apiKey: "" }
  });

  const onSubmit = (values: LoginFormValues) => {
    setError(null);
    signIn(values.apiKey);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-slate-600">Ingresa tu ADMIN_API_KEY para administrar empresas.</p>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="apiKey">ADMIN_API_KEY</Label>
            <Input id="apiKey" type="password" {...form.register("apiKey")} />
            {form.formState.errors.apiKey && <p className="mt-1 text-sm text-red-600">{form.formState.errors.apiKey.message}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit">Continuar</Button>
        </form>
      </div>
    </div>
  );
}
