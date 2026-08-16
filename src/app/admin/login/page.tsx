"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { uiSounds } from "@/lib/audio";
import { Lock, Mail, ShieldAlert } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin";

  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Invalid email or password");
      }

      uiSounds.playClick();
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-[#0F0F0F] relative overflow-hidden"
    >
      {/* Glow accent */}
      <div
        className="absolute -top-24 -left-24 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ backgroundColor: "#E11D2E" }}
      />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <span className="font-heading font-bold text-2xl tracking-tight text-white block">
          NETRON<span style={{ color: "#E11D2E" }}>iX</span>
        </span>
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mt-2">
          Operations Management Portal
        </p>
      </div>

      {/* Error Alert */}
      {authError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm"
          role="alert"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{authError}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 relative z-10" noValidate>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
            Staff Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="admin@netronix.giki.edu.pk"
              autoComplete="email"
              required
              {...register("email")}
              className="form-input pl-10"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-neutral-400 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
              {...register("password")}
              className="form-input pl-10"
            />
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          onClick={uiSounds.playClick}
          className="w-full py-3.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50 mt-2 cursor-pointer"
          style={{ backgroundColor: "#E11D2E" }}
          whileHover={{ backgroundColor: "#FF3B4D", scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? "Authenticating…" : "Sign In to Operations"}
        </motion.button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-xs font-mono text-neutral-500">
          Protected Staff Area • NETRONiX Network Society
        </p>
      </div>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-[#050505]">
      <Suspense
        fallback={
          <div className="text-neutral-500 font-mono text-xs">
            Loading Operations Portal…
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
