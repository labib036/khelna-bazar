"use client";

import { useState } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Check, Trash2, Home, Building } from "lucide-react";
import { toast } from "sonner";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      label: "Home",
      name: "Tanzim Ahmed",
      phone: "+880 1819-123456",
      line1: "House 24, Road 4, Sector 3, Apartment 5B",
      city: "Uttara",
      state: "Dhaka",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Office",
      name: "Tanzim Ahmed",
      phone: "+880 1819-123456",
      line1: "Concord Tower, Level 8, Gulshan 1",
      city: "Gulshan",
      state: "Dhaka",
      isDefault: false,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLine1, setNewLine1] = useState("");
  const [newCity, setNewCity] = useState("Dhaka");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newLine1) {
      toast.error("Please fill in all address fields.");
      return;
    }

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      name: newName,
      phone: newPhone,
      line1: newLine1,
      city: newCity,
      state: "Dhaka",
      isDefault: false,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddForm(false);
    setNewName("");
    setNewPhone("");
    setNewLine1("");
    toast.success("New delivery address saved!");
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.info("Address removed.");
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    toast.success("Default delivery address updated.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-black text-[#14213D] dark:text-white">
                Saved Delivery Addresses
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your home, office, and family delivery locations for faster Cash on Delivery checkout.
              </p>
            </div>

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="primary"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </Button>
          </div>

          {/* Add Address Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddAddress}
              className="p-6 rounded-3xl bg-white dark:bg-[#161D33] border border-[#1E5BFF] shadow-sm space-y-4 animate-in fade-in"
            >
              <h3 className="font-heading font-black text-sm text-[#14213D] dark:text-white">
                Add New Delivery Coordinates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Label</label>
                  <select
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full h-11 px-3 rounded-2xl border border-slate-200 text-xs"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Family">Family House</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Name</label>
                  <Input placeholder="Recipient name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone</label>
                  <Input placeholder="01700000000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City / Area</label>
                  <Input placeholder="e.g. Dhanmondi, Dhaka" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Street Address</label>
                  <Input placeholder="House, Road, Block, Flat" value={newLine1} onChange={(e) => setNewLine1(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" size="sm">
                  Save Address
                </Button>
                <Button type="button" onClick={() => setShowAddForm(false)} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Addresses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-heading font-black text-xs text-[#1E5BFF] flex items-center gap-1.5 uppercase tracking-wide">
                      {a.label === "Home" ? <Home className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
                      {a.label}
                    </span>
                    {a.isDefault && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Default Delivery
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-sm text-[#14213D] dark:text-white mt-2">{a.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{a.line1}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {a.city}, {a.state} &bull; {a.phone}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  {!a.isDefault && (
                    <button
                      onClick={() => handleSetDefault(a.id)}
                      className="text-[#1E5BFF] hover:underline font-bold cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-slate-400 hover:text-[#FF6B6B] p-1 ml-auto cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
