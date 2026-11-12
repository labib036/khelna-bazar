"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!isAdult) {
      toast.error("You must be 18 years or older to register an account.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email.trim(), "CUSTOMER", name.trim());
      toast.success("Account created successfully! Welcome to Khelna Bazar.");
      setIsLoading(false);
      router.push("/account");
    }, 500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Sign up in seconds to track orders, save delivery addresses, and enjoy 100 bonus PlayPoints.
          </p>
        </div>

        {/* Universal Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#DC012B]" />
              <span>Full Name *</span>
            </label>
            <Input
              placeholder="e.g. Tanzim Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#DC012B]" />
              <span>Email Address *</span>
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Mobile Phone Number *</span>
            </label>
            <Input
              placeholder="e.g. 01712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password (Min 8 Characters) *</span>
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-11"
            />
          </div>

          {/* Child Safety / Adult 18+ Checkbox */}
          <div className="pt-1.5">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#DC012B] focus:ring-[#DC012B] cursor-pointer accent-[#DC012B]"
                required
              />
              <span>
                I confirm that I am a parent, guardian, or an adult aged <strong>18 years or older</strong>.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-sm font-bold shadow-md bg-[#DC012B] hover:bg-[#B80023]"
          >
            <span>Create Account &bull; Claim 100 Points</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#DC012B] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
