"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { isValidBDPhone, isValidEmail } from "@/lib/auth-utils";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identifier.trim();

    if (!clean) {
      toast.error("Please enter your registered phone number or email.");
      return;
    }

    if (!isValidBDPhone(clean) && !isValidEmail(clean)) {
      toast.error("Please enter a valid Bangladeshi mobile number (01XXXXXXXXX) or email address.");
      return;
    }

    setIsLoading(true);
    // Simulate reset request
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast.success("Password reset instructions sent.");
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[var(--surface)] text-[var(--text-primary)] p-8 sm:p-10 rounded-3xl border border-[var(--border)] shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border border-[var(--border)] shadow-sm shrink-0">
              <Image
                src="/images/khelna-bazar-logo.png"
                alt="Khelna Bazar Logo"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div className="text-left flex flex-col">
              <span className="font-heading font-black text-2xl text-[var(--text-primary)] leading-none">
                KHELNA <span className="text-[var(--primary)]">BAZAR</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[var(--primary)] uppercase mt-0.5">
                khelnabazar.com.bd
              </span>
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-[var(--text-primary)]">Reset Your Password</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Enter your registered mobile phone number or email to receive a password reset verification code.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Check Your SMS / Inbox</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                If an account exists for <span className="font-semibold text-[var(--text-primary)]">{identifier}</span>, we have sent a 6-digit OTP verification code valid for 30 minutes.
              </p>
            </div>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="text-xs h-9"
            >
              Try another number
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                Phone Number or Email
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  placeholder="017XXXXXXXX or email@domain.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 h-11 text-sm bg-[var(--bg-primary)] border-[var(--border)] rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] rounded-xl shadow-sm transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending code...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
          <Link href="/login" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
