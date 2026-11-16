"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AccountNav } from "@/components/account/account-nav";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Check, Trash2, Home, Building, ArrowRight, X } from "lucide-react";
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

export default function AddressesPage() {
  const mounted = useMounted();
  const { data: session } = useSession();
  const user = session?.user;

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
      const serverAddrs = await getUserAddresses();
      if (serverAddrs && serverAddrs.length > 0) {
        const mapped: SavedAddress[] = serverAddrs.map((a) => ({
          id: a.id,
          label: a.label,
          name: a.fullName,
          phone: a.phone,
          division: a.division,
          city: a.city,
          line1: a.line1,
          isDefault: a.isDefault,
        }));
        setAddresses(mapped);
        try {
          localStorage.setItem(`kb_addr_${user.id}`, JSON.stringify(mapped));
        } catch {}
      } else {
        try {
          const stored = localStorage.getItem(`kb_addr_${user.id}`);
          if (stored) {
            setAddresses(JSON.parse(stored));
          } else {
            setAddresses([]);
          }
        } catch {}
      }
    } catch {
      try {
        const stored = localStorage.getItem(`kb_addr_${user.id}`);
        if (stored) setAddresses(JSON.parse(stored));
      } catch {}
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshAddresses();
  }, [refreshAddresses]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newFullAddress.trim()) {
      toast.error("Please fill in all address fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveAddress({
        label: newLabel,
        fullName: newName.trim(),
        phone: newPhone.trim(),
        division: newDivision,
        city: newCityArea.trim() || "Central Area",
        line1: newFullAddress.trim(),
        isDefault: addresses.length === 0,
      });

      if (res.success) {
        await refreshAddresses();
        setShowAddForm(false);
        setNewName("");
        setNewPhone("");
        setNewFullAddress("");
        setNewCityArea("");
        toast.success("New delivery address added successfully!");
      } else {
        toast.error(res.error || "Failed to save address.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    const prev = [...addresses];
    setAddresses((cur) => cur.filter((a) => a.id !== id));
    try {
      const res = await deleteAddress(id);
      if (!res.success) {
        setAddresses(prev);
        toast.error(res.error || "Failed to delete address.");
      } else {
        toast.info("Address removed.");
        refreshAddresses();
      }
    } catch {
      setAddresses(prev);
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    const prev = [...addresses];
    setAddresses((cur) => cur.map((a) => ({ ...a, isDefault: a.id === id })));
    try {
      const res = await setDefaultAddress(id);
      if (!res.success) {
        setAddresses(prev);
        toast.error(res.error || "Failed to set default address.");
      } else {
        toast.success("Default delivery destination updated.");
        refreshAddresses();
      }
    } catch {
      setAddresses(prev);
      toast.error("Failed to update default address.");
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading address book...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />
          <div className="flex-1 bg-[var(--surface-container-low)] p-8 sm:p-12 rounded-3xl border border-[var(--border)] text-center space-y-5 shadow-xs w-full">
            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto shadow-xs">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
                Sign In to Manage Addresses
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Save your home and office delivery addresses for fast 1-click Cash on Delivery orders.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?redirect=/account/addresses">
                <Button variant="primary" size="md" className="font-bold text-xs shadow-[0_4px_0_#93000E]">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="md" className="text-xs font-bold border-[var(--primary)] text-[var(--primary)]">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-6 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Bangladesh Delivery Book</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Saved Delivery Addresses
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Manage your home, school, and office toy delivery locations with fast Cash on Delivery checkout.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setShowAddForm(true)}
              variant="primary"
              size="sm"
              className="gap-1.5 rounded-full shadow-[0_4px_0_#93000E]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </Button>
          </div>

          {/* Add Address Modal */}
          {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowAddForm(false)} />
              <form
                onSubmit={handleAddAddress}
                className="relative w-full max-w-lg bg-[var(--surface-container-low)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] z-10 space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                    Add Delivery Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--surface)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">Address Type</label>
                    <div className="flex gap-2">
                      {(["Home", "Office", "Other"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setNewLabel(l)}
                          className={`flex-1 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            newLabel === l
                              ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-xs"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">Recipient Full Name *</label>
                    <Input
                      placeholder="e.g. Labib Ahmed"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="rounded-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">Mobile Phone Number (BD) *</label>
                    <Input
                      placeholder="e.g. 01712345678"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      required
                      className="rounded-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Division *</label>
                      <select
                        value={newDivision}
                        onChange={(e) => setNewDivision(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-full border border-[var(--border)] text-xs bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        {BD_DIVISIONS.map((d) => (
                          <option key={d} value={d}>
                            {d} Division
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-primary)]">Area / Thana *</label>
                      <Input
                        placeholder="e.g. Dhanmondi / Gulshan"
                        value={newCityArea}
                        onChange={(e) => setNewCityArea(e.target.value)}
                        required
                        className="rounded-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">Detailed Street Address *</label>
                    <Input
                      placeholder="House 12, Road 5, Sector 4, Apt 3A"
                      value={newFullAddress}
                      onChange={(e) => setNewFullAddress(e.target.value)}
                      required
                      className="rounded-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="flex-1 rounded-full shadow-[0_3px_0_#93000E]"
                    isLoading={isSubmitting}
                  >
                    Save Address
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Address Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingAddresses ? (
              <div className="col-span-2 p-8 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] text-center text-[var(--text-muted)] text-xs animate-pulse">
                Fetching verified delivery addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div className="col-span-2 p-8 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] text-center text-[var(--text-muted)] text-xs space-y-2">
                <MapPin className="w-8 h-8 mx-auto opacity-40 text-[var(--primary)]" />
                <p>No addresses saved yet. Click &quot;Add New Address&quot; above to create one.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-6 rounded-3xl bg-[var(--surface-container-low)] border transition-all flex flex-col justify-between shadow-xs ${
                    addr.isDefault ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20" : "border-[var(--border)]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[var(--surface)] text-[var(--primary)]">
                          {addr.label === "Home" ? (
                            <Home className="w-4 h-4" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-heading font-black text-xs text-[var(--text-primary)]">
                          {addr.label}
                        </span>
                      </div>

                      {addr.isDefault && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                          Default Destination
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <strong className="text-[var(--text-primary)] block font-heading">{addr.name}</strong>
                      <span className="text-[var(--text-muted)] block font-mono">{addr.phone}</span>
                      <p className="text-[var(--text-primary)] leading-relaxed">{addr.line1}</p>
                      <span className="text-[var(--text-muted)] block">
                        {addr.city}, {addr.division} Division
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
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Primary Address
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(addr.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer rounded-full hover:bg-[var(--surface)]"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}