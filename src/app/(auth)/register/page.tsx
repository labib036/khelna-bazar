"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/server/actions/auth-actions";
import { isValidBDPhone } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("next") || searchParams.get("redirect") || "";

  // Validate next redirect to prevent open redirect vulnerabilities
  const safeRedirect =
    rawRedirect &&
    rawRedirect.startsWith("/") &&
    !rawRedirect.startsWith("//") &&
    !rawRedirect.startsWith("/admin")
      ? rawRedirect
      : "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: "", percent: 0, color: "" };
    if (password.length < 6) return { label: "Too weak", percent: 25, color: "bg-rose-500" };
    if (password.length < 8) return { label: "Fair", percent: 50, color: "bg-amber-500" };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { label: "Strong", percent: 100, color: "bg-emerald-500" };
    }
    return { label: "Good", percent: 75, color: "bg-sky-500" };
  };

  const strength = getPasswordStrength();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.trim().replace(/[\s-]/g, "");

    if (!name.trim() || !cleanPhone || !password) {
      const msg = "Please fill in all required fields.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isValidBDPhone(cleanPhone)) {
      const msg = "Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 8) {
      const msg = "Password must be at least 8 characters long.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isAdult) {
      const msg = "You must confirm you are 18 years or older to register an account.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        password,
        isAdult,
      });

      if (!res.success) {
        const errorMsg = res.error || "Could not complete registration.";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Signing in...");

      // Automatically sign in the newly registered user
      await signIn("credentials", {
        identifier: cleanPhone,
        password,
        redirect: false,
      });

      router.push(safeRedirect);
      router.refresh();
    } catch {
      const errTxt = "Registration failed due to a network or server error. Please try again.";
      setErrorMessage(errTxt);
      toast.error(errTxt);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              Join Bangladesh&apos;s Most Trusted Toy Family
            </h2>
            <p className="text-sm text-white/90 leading-relaxed">
              Create an account to track Cash on Delivery dispatches in real-time, save your district addresses, and earn rewards points.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-white/20 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Get 100 PlayPoints bonus instantly upon registration</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>100% genuine, lab-certified child-safe products</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>Zero advance payment required &bull; Pay cash at delivery</span>
            </div>
          </div>
        </div>

        {/* Right Registration Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-5 bg-[var(--surface)]">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Create Free Account
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Sign up in under 30 seconds with your mobile number
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[var(--danger)] text-xs flex items-center gap-2.5 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="e.g. Tanzim Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Mobile Phone Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-[var(--text-primary)] select-none">
                  🇧🇩 +880
                </span>
                <input
                  type="tel"
                  placeholder="1712345678"
                  value={phone.startsWith("+880") ? phone.replace("+880", "").trim() : phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full h-10 pl-20 pr-4 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  placeholder="tanzim@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Password (min. 8 characters) *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-11 pr-11 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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

              {/* Password strength indicator */}
              {password && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 bg-[var(--surface-container-high)] h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{strength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-primary)]">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
            </div>

            {/* Age Confirmation */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11px] text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  checked={isAdult}
                  onChange={(e) => setIsAdult(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer mt-0.5 shrink-0"
                />
                <span>
                  I confirm that I am 18 years or older and agree to the{" "}
                  <Link href="/pages/terms-and-conditions" className="text-[var(--primary)] underline font-bold" target="_blank">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/pages/privacy-policy" className="text-[var(--primary)] underline font-bold" target="_blank">
                    Privacy Policy
                  </Link>
                  .
                </span>
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
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[var(--border)] w-full" />
            <span className="bg-[var(--surface)] px-3 text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] shrink-0">
              or sign up with
            </span>
            <div className="border-t border-[var(--border)] w-full" />
          </div>

          <GoogleSignInButton text="Sign up with Google" callbackUrl="/dashboard" />

          <div className="pt-3 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[var(--primary)] hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
