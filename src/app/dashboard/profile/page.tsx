"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { updateUserProfile, updateUserPassword } from "@/server/actions/auth-actions";
import { User, Phone, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if ((user as any).phone) setPhone((user as any).phone);
      if (user.email && !user.email.includes("@khelnabazar.user")) {
        setEmail(user.email);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(isBn ? "অনুগ্রহ করে আপনার নাম লিখুন।" : "Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      toast.error(isBn ? "অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন।" : "Please enter your phone number.");
      return;
    }

    setIsUpdatingProfile(true);
    const res = await updateUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    });
    setIsUpdatingProfile(false);

    if (res.success) {
      toast.success(isBn ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!");
    } else {
      toast.error(res.error || (isBn ? "প্রোফাইল আপডেট ব্যর্থ হয়েছে।" : "Failed to update profile."));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error(isBn ? "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।" : "New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(isBn ? "পাসওয়ার্ড দুটি মিলছে না।" : "New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updateUserPassword({
      currentPassword: currentPassword.trim() || undefined,
      newPassword: newPassword.trim(),
    });
    setIsUpdatingPassword(false);

    if (res.success) {
      toast.success(isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" : "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || (isBn ? "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।" : "Failed to update password."));
    }
  };

  if (status === "loading") {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>{isBn ? "প্রোফাইল সেটিংস লোড হচ্ছে..." : "Loading profile settings..."}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          {isBn ? "প্রোফাইল ও পাসওয়ার্ড সেটিংস" : "Profile & Password Settings"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          {isBn
            ? "ডেলিভারি নিশ্চিতকরণের জন্য যোগাযোগের নম্বর এবং লগইন পাসওয়ার্ড পরিচালনা করুন।"
            : "Update your contact phone for delivery verification and manage your login password."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
              {isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                {isBn ? "পূর্ণ নাম" : "Full Name"}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBn ? "যেমন: আবরার ফাহিম" : "e.g. Abrar Fahim"}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                {isBn ? "প্রধান মোবাইল নম্বর" : "Primary Mobile Number"}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  required
                />
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                {isBn ? "ডেলিভারির সময় কুরিয়ার থেকে যোগাযোগের জন্য ব্যবহৃত হবে।" : "Used by delivery couriers to confirm your package arrival."}
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                {isBn ? "ইমেইল ঠিকানা" : "Email Address"}{" "}
                <span className="font-normal text-[var(--text-muted)]">({isBn ? "ঐচ্ছিক" : "Optional"})</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUpdatingProfile}
              className="font-bold text-xs"
            >
              {isUpdatingProfile
                ? isBn ? "সংরক্ষণ হচ্ছে..." : "Saving..."
                : isBn ? "প্রোফাইল সংরক্ষণ করুন" : "Save Profile Details"}
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <Lock className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
              {isBn ? "অ্যাকাউন্ট পাসওয়ার্ড পরিবর্তন" : "Change Account Password"}
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                {isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isBn ? "পূর্বে পাসওয়ার্ড থাকলে লিখুন" : "Enter current password if set"}
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isBn ? "কমপক্ষে ৮ অক্ষর" : "Minimum 8 characters"}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                {isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isBn ? "পুনরায় নতুন পাসওয়ার্ড লিখুন" : "Re-enter new password"}
                required
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isUpdatingPassword}
              className="font-bold text-xs"
            >
              {isUpdatingPassword
                ? isBn ? "আপডেট হচ্ছে..." : "Updating..."
                : isBn ? "পাসওয়ার্ড পরিবর্তন করুন" : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
