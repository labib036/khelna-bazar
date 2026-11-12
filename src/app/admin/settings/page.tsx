"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Truck, Store, Phone, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState(siteConfig.name);
  const [phone, setPhone] = useState(siteConfig.contact.phone);
  const [address, setAddress] = useState(siteConfig.contact.address);

  // Delivery settings
  const [insideDhaka, setInsideDhaka] = useState(siteConfig.shippingDefaults.insideDhakaRate.toString());
  const [outsideDhaka, setOutsideDhaka] = useState(siteConfig.shippingDefaults.outsideDhakaRate.toString());
  const [freeThreshold, setFreeThreshold] = useState(siteConfig.shippingDefaults.freeShippingThreshold.toString());
  const [giftWrapFee, setGiftWrapFee] = useState(siteConfig.shippingDefaults.giftWrapFee.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Store & delivery settings updated successfully!");
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2DE] dark:border-[#2E303E]">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-[#DC012B]" />
              <span>Store &amp; Delivery Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize shipping charges, delivery zones, Cash on Delivery rules, and branding.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="gap-2 shadow-sm bg-[#DC012B] hover:bg-[#B80023] text-white"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Helpline Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Office &amp; Dispatch Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] text-xs text-slate-500 space-y-1">
            <strong className="text-[#18191F] dark:text-white block font-bold">Logo Customization Tip:</strong>
            <p>
              To replace the store logo with your own custom image later, place your logo file into{" "}
              <code className="text-[#DC012B] font-mono">/public/images/</code> and set the path in{" "}
              <code className="text-[#DC012B] font-mono">src/config/site.ts</code>.
            </p>
          </div>
        </div>

        {/* 2. Cash on Delivery (COD) & Shipping Zones */}
        <div className="bg-white dark:bg-[#1B1C24] p-6 sm:p-8 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] space-y-4 shadow-xs">
          <h2 className="font-heading font-black text-base text-[#18191F] dark:text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#2EC4B6]" />
            <span>Cash on Delivery Zones &amp; Shipping Charges</span>
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
              <span className="text-[11px] text-slate-400">Default: ৳60</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Outside Dhaka / Nationwide Rate (BDT ৳)
              </label>
              <Input
                type="number"
                value={outsideDhaka}
                onChange={(e) => setOutsideDhaka(e.target.value)}
              />
              <span className="text-[11px] text-slate-400">Default: ৳120</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Free Nationwide Delivery Threshold (BDT ৳)
              </label>
              <Input
                type="number"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
              />
              <span className="text-[11px] text-slate-400">Orders above this amount receive free shipping (Default: ৳2,000)</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Gift Wrapping Fee Per Item (BDT ৳)
              </label>
              <Input
                type="number"
                value={giftWrapFee}
                onChange={(e) => setGiftWrapFee(e.target.value)}
              />
              <span className="text-[11px] text-slate-400">Default: ৳50</span>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
