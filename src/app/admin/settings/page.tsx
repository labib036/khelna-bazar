"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSettingsAction, saveSettings } from "@/server/actions/settings-actions";
import { Settings, Truck, Store, Phone, ShieldCheck, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState(siteConfig.name);
  const [phone, setPhone] = useState(siteConfig.contact.phone);
  const [address, setAddress] = useState(siteConfig.contact.address);

  // Delivery settings
  const [insideDhaka, setInsideDhaka] = useState(siteConfig.shippingDefaults.insideDhakaRate.toString());
  const [outsideDhaka, setOutsideDhaka] = useState(siteConfig.shippingDefaults.outsideDhakaRate.toString());
  const [freeThreshold, setFreeThreshold] = useState(siteConfig.shippingDefaults.freeShippingThreshold.toString());

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSettingsAction().then((res) => {
      if (mounted && res.success && res.settings) {
        if (res.settings.insideDhakaRate !== undefined) setInsideDhaka(res.settings.insideDhakaRate.toString());
        if (res.settings.outsideDhakaRate !== undefined) setOutsideDhaka(res.settings.outsideDhakaRate.toString());
        if (res.settings.freeShippingThreshold !== undefined) setFreeThreshold(res.settings.freeShippingThreshold.toString());
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await saveSettings({
      insideDhakaRate: parseInt(insideDhaka) || 60,
      outsideDhakaRate: parseInt(outsideDhaka) || 120,
      freeShippingThreshold: parseInt(freeThreshold) || 0,
    });
    setIsSaving(false);

    if (res.success) {
      toast.success("Store and delivery settings saved successfully!");
    } else {
      toast.error(res.error || "Failed to save settings.");
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2DE] dark:border-[#2E303E]">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-[#DC012B]" />
              <span>Store &amp; Delivery Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure delivery rates, Cash on Delivery options, and customer support channels.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            variant="primary"
            size="md"
            className="gap-2 shadow-sm bg-[#DC012B] hover:bg-[#B80023] text-white cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save All Settings"}</span>
          </Button>
        </div>

        {/* 1. Brand & Contact Information */}
        <div className="bg-white dark:bg-[#1B1C24] p-6 sm:p-8 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] space-y-4 shadow-sm">
          <h2 className="font-heading font-black text-base text-[#18191F] dark:text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-[#DC012B]" />
            <span>General Store Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Store Name</label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Customer Support Phone &amp; WhatsApp
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 2. Cash on Delivery (COD) & Shipping Zones */}
        <div className="bg-white dark:bg-[#1B1C24] p-6 sm:p-8 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] space-y-4 shadow-xs">
          <h2 className="font-heading font-black text-base text-[#18191F] dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#2EC4B6]" />
            <span>Delivery Rates &amp; Zones</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Inside Dhaka Rate (BDT ৳)
              </label>
              <Input
                type="number"
                value={insideDhaka}
                onChange={(e) => setInsideDhaka(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Outside Dhaka (Nationwide) Rate (BDT ৳)
              </label>
              <Input
                type="number"
                value={outsideDhaka}
                onChange={(e) => setOutsideDhaka(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Free Shipping Threshold (BDT ৳, 0 to disable)
              </label>
              <Input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
  );
}
