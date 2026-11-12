"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email);
      toast.success("Welcome back to Khelna Bazar!");
      setIsLoading(false);
      if (email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push(redirectUrl);
      }
    }, 600);
  };

  const handleQuickDemoLogin = (demoRole: "ADMIN" | "STAFF" | "CUSTOMER") => {
    if (demoRole === "ADMIN") {
      login("admin@khelnabazar.com", "ADMIN", "Khelna Bazar Owner");
      toast.success("Logged in as Store Owner (Admin Role)!");
      router.push("/admin");
    } else if (demoRole === "STAFF") {
      login("staff@khelnabazar.com", "STAFF", "Operations Manager");
      toast.success("Logged in as Staff!");
      router.push("/admin/orders");
    } else {
      login("customer@khelnabazar.com", "CUSTOMER", "Tanzim Ahmed");
      toast.success("Logged in as Customer!");
      router.push("/account");
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#161D33] p-8 sm:p-10 rounded-3xl border border-[#E3E8F2] dark:border-[#263050] shadow-sm">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shadow-xs">
            <Image src="/images/khelna-bazar-logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-heading font-black text-2xl text-[#14213D] dark:text-white">
            KHELNA <span className="text-[#1E5BFF]">BAZAR</span>
          </span>
        </Link>
        <h1 className="font-heading text-xl font-bold text-[#14213D] dark:text-white">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-slate-500">
          Track orders, manage addresses, and redeem PlayPoints rewards.
        </p>
      </div>

      {/* 1-Click Demo Logins for Testing */}
      <div className="p-3.5 rounded-2xl bg-[#F7F9FC] dark:bg-[#1E2742] border border-[#E3E8F2] dark:border-[#263050] space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
          ⚡ Quick 1-Click Demo Login
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("ADMIN")}
            className="py-1.5 px-2 rounded-xl bg-[#1E5BFF] text-white text-[11px] font-bold hover:bg-[#1546CC] transition-colors cursor-pointer"
          >
            👑 Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("STAFF")}
            className="py-1.5 px-2 rounded-xl bg-[#7B5CFA] text-white text-[11px] font-bold hover:bg-[#6343E0] transition-colors cursor-pointer"
          >
            👔 Staff
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin("CUSTOMER")}
            className="py-1.5 px-2 rounded-xl bg-[#2EC4B6] text-white text-[11px] font-bold hover:bg-[#229D92] transition-colors cursor-pointer"
          >
            🛍️ Customer
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#1E5BFF]" />
            <span>Email Address</span>
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password</span>
            </label>
            <span className="text-[11px] text-[#1E5BFF] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full text-xs font-bold shadow-md">
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-500">
        Don't have an account yet?{" "}
        <Link href="/register" className="font-bold text-[#1E5BFF] hover:underline">
          Create an Account
        </Link>
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
