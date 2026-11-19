"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { Phone, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { isValidBDPhone, isValidEmail } from "@/lib/auth-utils";

export default function ForgotPasswordPage() {
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identifier.trim();

    if (!clean) {
      toast.error(isBn ? "অনুগ্রহ করে আপনার ফোন নম্বর বা ইমেইল লিখুন।" : "Please enter your registered phone number or email.");
      return;
    }

    if (!isValidBDPhone(clean) && !isValidEmail(clean)) {
      toast.error(
        isBn
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর (০১XXXXXXXXX) অথবা সঠিক ইমেইল দিন।"
          : "Please enter a valid Bangladeshi mobile number (01XXXXXXXXX) or email address."
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 300);
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
            <h1 className="text-lg font-black text-[var(--text-primary)]">
              {isBn ? "পাসওয়ার্ড পুনরুদ্ধার" : "Reset Your Password"}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {isBn
                ? "পাসওয়ার্ড রিসেটের জন্য আপনার নিবন্ধিত ফোন নম্বর বা ইমেইল দিন।"
                : "Enter your registered mobile phone number or email for password reset assistance."}
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                {isBn ? "কাস্টমার সাপোর্ট সহায়তা" : "Support Helpline Assistance"}
              </h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {isBn
                  ? `আপনার অ্যাকাউন্ট "${identifier}"-এর পাসওয়ার্ড পরিবর্তনের জন্য সরাসরি আমাদের হেল্পলাইনে যোগাযোগ করুন:`
                  : `For account assistance (${identifier}), please contact our customer support team directly:`}
              </p>
              <div className="p-3.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
                <a
                  href="https://wa.me/8801712039707?text=Hi%20Khelna%20Bazar,%20I%20need%20to%20reset%20my%20password."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-10 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isBn ? "WhatsApp-এ মেসেজ করুন (01712-039707)" : "WhatsApp Support (01712-039707)"}</span>
                </a>
                <a
                  href="tel:01712039707"
                  className="w-full h-10 px-4 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-container-high)] border border-[var(--border)] text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>{isBn ? "কল করুন: 01712-039707" : "Call Hotline: 01712-039707"}</span>
                </a>
              </div>
            </div>
            <Button
              onClick={() => setSubmitted(false)}
              variant="outline"
              className="text-xs h-9 cursor-pointer"
            >
              {isBn ? "অন্য নম্বর বা ইমেইল চেষ্টা করুন" : "Try another phone or email"}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                {isBn ? "মোবাইল নম্বর অথবা ইমেইল" : "Phone Number or Email"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  placeholder={isBn ? "017XXXXXXXX বা name@example.com" : "017XXXXXXXX or email@domain.com"}
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
              className="w-full h-11 text-sm font-bold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isBn ? "যাচাই হচ্ছে..." : "Submitting..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span>{isBn ? "সহায়তা গ্রহণ করুন" : "Get Support"}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
          <Link href="/login" className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? "লগইনে ফিরে যান" : "Back to Sign In"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
