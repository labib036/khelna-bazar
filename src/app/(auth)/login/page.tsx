"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("next") || searchParams.get("redirect") || "";

  // Validate next redirect to prevent open redirect vulnerabilities
  const safeRedirect =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      const msg = "Please enter your mobile number or email, and your password.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: cleanId,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        const errorMsg = "Invalid credentials. Please verify your phone/email and password.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      toast.success("Welcome back to Khelna Bazar!");

      if (safeRedirect) {
        router.push(safeRedirect);
        router.refresh();
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      const errTxt = "An unexpected connection error occurred during sign in.";
      setErrorMessage(errTxt);
      toast.error(errTxt);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-4xl overflow-hidden border border-[var(--border)] shadow-2xl bg-[var(--surface-container-low)]">
      {/* Left Brand Illustration & Benefit Panel (Desktop only) */}
      <div
        className="hidden md:flex flex-col justify-between p-10 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #AE0012 0%, #D71921 55%, #FCB812 100%)",
          backgroundColor: "#D71921",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.2),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="relative w-12 h-12 rounded-2xl bg-white p-1 overflow-hidden shadow-md">
              <Image src="/images/khelna-bazar-logo.png" alt="Logo" fill className="object-contain p-1" sizes="48px" />
            </div>
            <div>
              <span className="font-heading font-black text-xl tracking-tight block">Khelna Bazar</span>
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Joy Toy Boutique</span>
            </div>
          </Link>

          <h2 className="font-heading text-3xl font-black leading-tight pt-4">
            Joyful, Engaging &amp; Tested Toys for Every Child
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">
            Sign in to manage your Cash on Delivery orders, track delivery milestones, and redeem PlayPoints rewards.
          </p>
        </div>

        <div className="relative z-10 space-y-3 pt-8 border-t border-white/20 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Inspect Before You Accept at Delivery</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-amber-200 shrink-0" />
            <span>Doorstep Cash on Delivery Nationwide</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>100 PlayPoints on Account Creation</span>
          </div>
        </div>
      </div>

      {/* Right Sign-in Form */}
      <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-[var(--surface)]">
        <div className="space-y-2">
          {/* Mobile brand mark */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <div className="relative w-9 h-9 rounded-full bg-white p-0.5 overflow-hidden border border-[var(--border)] shadow-xs">
              <Image src="/images/khelna-bazar-logo.png" alt="Logo" fill className="object-contain" sizes="36px" />
            </div>
            <span className="font-heading font-black text-lg text-[var(--text-primary)]">Khelna Bazar</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Welcome Back!
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Sign in with your mobile phone or registered email
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] text-xs flex items-center gap-2.5 animate-shake">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[var(--text-primary)]">
              Phone Number or Email
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                autoComplete="username"
                placeholder="017XXXXXXXX or user@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--primary)] hover:underline font-bold"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-11 pr-11 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
              />
              <span>Remember me</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            variant="pill-primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-xs font-black shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] h-11 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-4 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[var(--primary)] hover:underline">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center p-8 text-xs text-[var(--text-muted)]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
