"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile, updateUserPassword } from "@/server/actions/auth-actions";
import { User, Phone, Mail, Lock, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { data: session, status } = useSession();
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
      if ((user as any).phone) setPhone((user as any).phone);
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
      <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>Loading profile settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Profile &amp; Password Settings
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          Update your contact phone for delivery verification and manage your login password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
              Personal Information
            </h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abrar Fahim"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Primary Mobile Number</label>
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
                Used by delivery couriers to confirm your package arrival.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">
                Email Address <span className="font-normal text-[var(--text-muted)]">(Optional)</span>
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
              {isUpdatingProfile ? "Saving..." : "Save Profile Details"}
            </Button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--border)]">
            <Lock className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
              Change Account Password
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password if set"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[var(--text-primary)]">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
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
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
