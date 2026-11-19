"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMounted } from "@/lib/use-mounted";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Check, Trash2, Home, Building, X } from "lucide-react";
import { toast } from "sonner";
import {
  getUserAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/server/actions/address-actions";

interface SavedAddress {
  id: string;
  label: "Home" | "Office" | "Other";
  name: string;
  phone: string;
  division: string;
  city: string;
  line1: string;
  isDefault: boolean;
}

const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

export default function CustomerAddressesPage() {
  const mounted = useMounted();
  const { data: session } = useSession();
  const user = session?.user;
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLabel, setNewLabel] = useState<"Home" | "Office" | "Other">("Home");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDivision, setNewDivision] = useState("Dhaka");
  const [newCityArea, setNewCityArea] = useState("");
  const [newFullAddress, setNewFullAddress] = useState("");

  const refreshAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoadingAddresses(true);
      const res = await getUserAddresses();
      if (Array.isArray(res)) {
        setAddresses(
          res.map((a: any) => ({
            id: a.id,
            label: (a.label as "Home" | "Office" | "Other") || "Home",
            name: a.fullName,
            phone: a.phone,
            division: a.division,
            city: a.city,
            line1: a.line1,
            isDefault: a.isDefault,
          }))
        );
      }
    } catch {
      toast.error(isBn ? "সংরক্ষিত ঠিকানা লোড করা যায়নি।" : "Failed to load saved addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id, isBn]);

  useEffect(() => {
    if (mounted && user?.id) {
      refreshAddresses();
    }
  }, [mounted, user?.id, refreshAddresses]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newFullAddress || !newCityArea) {
      toast.error(isBn ? "অনুগ্রহ করে সকল তথ্য পূরণ করুন।" : "Please fill in all address fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveAddress({
        label: newLabel,
        fullName: newName.trim(),
        phone: newPhone.trim(),
        division: newDivision,
        city: newCityArea.trim(),
        line1: newFullAddress.trim(),
        isDefault: addresses.length === 0,
      });

      if (res.success) {
        toast.success(isBn ? "ডেলিভারি ঠিকানা সফলভাবে সংরক্ষিত হয়েছে!" : "Delivery address saved successfully!");
        setShowAddForm(false);
        setNewName("");
        setNewPhone("");
        setNewCityArea("");
        setNewFullAddress("");
        await refreshAddresses();
      } else {
        toast.error(res.error || (isBn ? "ঠিকানা সংরক্ষণ করা যায়নি।" : "Failed to save address"));
      }
    } catch {
      toast.error(isBn ? "ঠিকানা সংরক্ষণ করা যায়নি।" : "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await setDefaultAddress(id);
      if (res.success) {
        toast.success(isBn ? "ডিফল্ট ঠিকানা আপডেট করা হয়েছে" : "Default address updated");
        await refreshAddresses();
      } else {
        toast.error(res.error || (isBn ? "ডিফল্ট ঠিকানা পরিবর্তন ব্যর্থ হয়েছে" : "Failed to update default address"));
      }
    } catch {
      toast.error(isBn ? "সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Failed to set default address");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm(isBn ? "আপনি কি এই ঠিকানাটি মুছে ফেলতে চান?" : "Are you sure you want to delete this address?")) return;
    try {
      const res = await deleteAddress(id);
      if (res.success) {
        toast.success(isBn ? "ঠিকানা মুছে ফেলা হয়েছে" : "Address removed");
        await refreshAddresses();
      } else {
        toast.error(res.error || (isBn ? "ঠিকানা মোছা যায়নি" : "Failed to remove address"));
      }
    } catch {
      toast.error(isBn ? "সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Failed to remove address");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isBn ? "সংরক্ষিত ডেলিভারি ঠিকানা" : "Saved Delivery Addresses"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {isBn
              ? "দ্রুত চেকআউটের জন্য আপনার বাসা, অফিস বা পরিবারের ঠিকানা সংরক্ষণ করুন।"
              : "Manage your home, office, and family delivery locations for faster Cash on Delivery checkout."}
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
          size="sm"
          className="font-bold text-xs gap-1.5 shadow-xs"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? (isBn ? "বাতিল" : "Cancel") : (isBn ? "নতুন ঠিকানা যোগ করুন" : "Add New Address")}</span>
        </Button>
      </div>

      {/* Add Address Form Modal / Expandable Card */}
      {showAddForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--primary)] shadow-sm space-y-4">
          <h3 className="font-heading font-black text-base text-[var(--text-primary)]">
            {isBn ? "নতুন ডেলিভারি ঠিকানা যোগ করুন" : "Add Verified Delivery Destination"}
          </h3>

          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="flex gap-2">
              {(["Home", "Office", "Other"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setNewLabel(l)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    newLabel === l
                      ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-2xs"
                      : "bg-[var(--surface-container-high)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {l === "Home" ? (isBn ? "বাসা" : "Home") : l === "Office" ? (isBn ? "অফিস" : "Office") : (isBn ? "অন্যান্য" : "Other")}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">
                  {isBn ? "প্রাপকের পূর্ণ নাম" : "Recipient Full Name"}
                </label>
                <Input
                  placeholder={isBn ? "যেমন: আবরার ফাহিম" : "e.g. Abrar Fahim"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">
                  {isBn ? "যোগাযোগের মোবাইল নম্বর" : "Contact Mobile Number"}
                </label>
                <Input
                  placeholder={isBn ? "যেমন: 01712039707" : "e.g. 01712039707"}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">
                  {isBn ? "বিভাগ" : "Division / Region"}
                </label>
                <select
                  value={newDivision}
                  onChange={(e) => setNewDivision(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl border border-[var(--border)] text-xs bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} {isBn ? "বিভাগ" : "Division"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">
                  {isBn ? "এলাকা / শহর / থানা" : "City / District / Thana"}
                </label>
                <Input
                  placeholder={isBn ? "যেমন: ধানমন্ডি, ঢাকা" : "e.g. Dhanmondi, Dhaka"}
                  value={newCityArea}
                  onChange={(e) => setNewCityArea(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-[var(--text-primary)]">
                  {isBn ? "বিস্তারিত ঠিকানা (বাড়ি, রোড, ফ্ল্যাট নম্বর)" : "Detailed Street Address / House / Road"}
                </label>
                <Input
                  placeholder={isBn ? "যেমন: বাড়ি ৪৫, রোড ২৭, ব্লক এ" : "e.g. House 45, Road 27, Block A"}
                  value={newFullAddress}
                  onChange={(e) => setNewFullAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="font-bold text-xs">
                {isBn ? "ঠিকানা সংরক্ষণ করুন" : "Save Address"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoadingAddresses ? (
          <div className="col-span-2 p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center text-[var(--text-muted)] text-xs">
            {isBn ? "ঠিকানা লোড হচ্ছে..." : "Loading your addresses..."}
          </div>
        ) : addresses.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs space-y-3">
            <MapPin className="w-8 h-8 mx-auto opacity-40 text-[var(--primary)]" />
            <p className="font-bold text-sm text-[var(--text-primary)]">
              {isBn ? "কোনো ঠিকানা সংরক্ষিত নেই" : "No addresses saved yet"}
            </p>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto">
              {isBn
                ? "ভবিষ্যতে দ্রুত চেকআউট করার জন্য আপনার বাসা বা অফিসের ঠিকানা যোগ করুন।"
                : "Add your home or office address to speed up your future Cash on Delivery checkouts."}
            </p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl bg-[var(--surface)] border transition-all flex flex-col justify-between shadow-xs ${
                addr.isDefault
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[var(--surface-container-high)] text-[var(--primary)]">
                      {addr.label === "Home" ? <Home className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                    </div>
                    <span className="font-heading font-black text-xs text-[var(--text-primary)]">
                      {addr.label === "Home" ? (isBn ? "বাসা" : "Home") : addr.label === "Office" ? (isBn ? "অফিস" : "Office") : (isBn ? "অন্যান্য" : "Other")}
                    </span>
                  </div>

                  {addr.isDefault && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      {isBn ? "ডিফল্ট ঠিকানা" : "Default Destination"}
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <strong className="text-[var(--text-primary)] block font-heading">{addr.name}</strong>
                  <span className="text-[var(--text-muted)] block font-mono">{addr.phone}</span>
                  <p className="text-[var(--text-primary)] leading-relaxed">{addr.line1}</p>
                  <span className="text-[var(--text-muted)] block">
                    {addr.city}, {addr.division} {isBn ? "বিভাগ" : "Division"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] mt-4 flex items-center justify-between">
                {!addr.isDefault ? (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs text-[var(--primary)] font-bold hover:underline cursor-pointer"
                  >
                    {isBn ? "ডিফল্ট নির্ধারণ করুন" : "Set as Default"}
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {isBn ? "প্রধান ঠিকানা" : "Primary Address"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(addr.id)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-rose-500 transition-colors cursor-pointer rounded-full hover:bg-[var(--surface-container-high)]"
                  title={isBn ? "ঠিকানা মুছুন" : "Delete address"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
