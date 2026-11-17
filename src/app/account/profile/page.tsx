"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile, updateUserPassword } from "@/server/actions/auth-actions";
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status ?? "unauthenticated";
  const user = session?.user;

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
      if (user.phone) setPhone(user.phone);
      if (user.email && !user.email.includes("@khelnabazar.user")) {
        setEmail(user.email);
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
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
      toast.success("Profile updated successfully!");
    } else {
      toast.error(res.error || "Failed to update profile.");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updateUserPassword({
      currentPassword: currentPassword.trim() || undefined,
      newPassword: newPassword.trim(),
    });
    setIsUpdatingPassword(false);

    if (res.success) {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.error || "Failed to update password.");
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-8 w-full">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Personal Profile &amp; Security
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Update your account details, phone number for delivery notices, and security credentials.
            </p>
          </div>

          {/* Profile Details Form */}
          <div className="bg-[var(--surface-container-low)] p-6 sm:p-8 rounded-4xl border border-[var(--border)] shadow-xs space-y-6">
            <h2 className="font-heading font-black text-lg text-[var(--text-primary)] flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--primary)]" />
              <span>Contact Information</span>
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Full Name</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 rounded-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Mobile Phone Number</label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11 rounded-full font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-11 rounded-full"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  variant="pill-primary"
                  size="md"
                  className="font-bold text-xs"
                >
                  {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-[var(--surface-container-low)] p-6 sm:p-8 rounded-4xl border border-[var(--border)] shadow-xs space-y-6">
            <h2 className="font-heading font-black text-lg text-[var(--text-primary)] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--primary)]" />
              <span>Change Password</span>
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter existing password"
                  className="h-11 rounded-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="h-11 rounded-full"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="h-11 rounded-full"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  variant="pill-amber"
                  size="md"
                  className="font-bold text-xs"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
