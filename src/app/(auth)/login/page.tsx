"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { login } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Please enter your username/email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(identifier.trim());
      toast.success("Welcome to Khelna Bazar!");
      setIsLoading(false);

      if (identifier.toLowerCase().includes("admin") || identifier.toLowerCase() === "owner") {
        router.push("/admin");
      } else {
        router.push(redirectUrl);
      }
    }, 450);
  };

  return (
    <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#1B1C24] p-8 sm:p-10 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm">
      {/* Brand Header */}
      <div className="text-center space-y-2.5">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 shadow-sm movable-logo shrink-0">
            <Image
              src="/images/khelna-bazar-logo.gif"
              alt="Khelna Bazar Logo"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          <div className="text-left flex flex-col">
            <span className="font-heading font-black text-2xl text-[#18191F] dark:text-white leading-none">
              KHELNA <span className="text-[#DC012B]">BAZAR</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[#DC012B] uppercase mt-0.5">
              khelnabazar.com.bd
            </span>
          </div>
        </Link>

        <h1 className="font-heading text-xl font-bold text-[#18191F] dark:text-white pt-2">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-slate-500">
          Enter your username or email and password to continue.
        </p>
      </div>

      {/* Universal Sign In Form */}
      <form onSubmit={handleLogin} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#DC012B]" />
            <span>Username or Email</span>
          </label>
          <Input
            type="text"
            placeholder="Username or your@email.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password</span>
            </label>
            <span className="text-[11px] text-[#DC012B] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-sm font-bold shadow-md bg-[#DC012B] hover:bg-[#B80023]"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Registration Callout */}
      <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
        New to Khelna Bazar?{" "}
        <Link href="/register" className="font-bold text-[#DC012B] hover:underline">
          Create a free account
        </Link>
      </div>

      {/* Subtle Admin Tip */}
      <div className="pt-1 text-center">
        <p className="text-[11px] text-slate-400">
          Store managers & admins: sign in with your staff or admin email.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-400">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
