"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from "lucide-react";
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
    if (!name || !email || !password || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!isAdult) {
      toast.error("You must be 18 years or older to register an account.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      login(email, "CUSTOMER", name);
      toast.success("Account created successfully! Welcome to Khelna Bazar.");
      setIsLoading(false);
      router.push("/account");
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#161D33] p-8 sm:p-10 rounded-3xl border border-[#E3E8F2] dark:border-[#263050] shadow-sm">
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
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Earn 100 PlayPoints welcome bonus and enjoy faster Cash on Delivery checkout.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1E5BFF]" />
              <span>Full Name *</span>
            </label>
            <Input
              placeholder="e.g. Tanzim Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2EC4B6]" />
              <span>Email Address *</span>
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
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#7B5CFA]" />
              <span>Mobile Phone Number *</span>
            </label>
            <Input
              placeholder="e.g. 01712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
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
            />
          </div>

          {/* Child Safety / COPPA 18+ Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-[#1E5BFF] focus:ring-[#1E5BFF] cursor-pointer"
                required
              />
              <span>
                I confirm that I am a parent, guardian, or an adult aged <strong>18 years or older</strong>.
              </span>
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full text-xs font-bold shadow-md">
            <span>Create Account &bull; Claim 100 Points</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="font-bold text-[#1E5BFF] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
