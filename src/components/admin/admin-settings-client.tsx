"use client";

import { useState, useTransition } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreSettings } from "@/types/store";
import { saveSettings } from "@/server/actions/settings-actions";
import { Settings, Truck, Store, Save, Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminSettingsClientProps {
  initialSettings: StoreSettings;
}

export function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [storeName, setStoreName] = useState(initialSettings.storeName || siteConfig.name);
  const [phone, setPhone] = useState(initialSettings.hotline || siteConfig.contact.phone);
  const [supportEmail, setSupportEmail] = useState(initialSettings.supportEmail || siteConfig.contact.email);
  const [address, setAddress] = useState(initialSettings.address || siteConfig.contact.address);
  const [announcement, setAnnouncement] = useState(
    initialSettings.announcementText || "Cash on Delivery • bKash • Nagad | Hotline & WhatsApp: 01712-039707"
  );

  // Delivery settings
  const [insideDhaka, setInsideDhaka] = useState(
    (initialSettings.insideDhakaRate ?? 60).toString()
  );
  const [outsideDhaka, setOutsideDhaka] = useState(
    (initialSettings.outsideDhakaRate ?? 120).toString()
  );
  const [freeThreshold, setFreeThreshold] = useState(
    (initialSettings.freeShippingThreshold ?? 1500).toString()
  );
  const [giftWrapFee, setGiftWrapFee] = useState(
    (initialSettings.giftWrapFee ?? 50).toString()
  );

  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await saveSettings({
        storeName: storeName.trim() || siteConfig.name,
        hotline: phone.trim(),
        supportEmail: supportEmail.trim(),
        address: address.trim(),
        announcementText: announcement.trim(),
        insideDhakaRate: Math.max(0, parseInt(insideDhaka) || 60),
        outsideDhakaRate: Math.max(0, parseInt(outsideDhaka) || 120),
        freeShippingThreshold: Math.max(0, parseInt(freeThreshold) || 1500),
        giftWrapFee: Math.max(0, parseInt(giftWrapFee) || 50),
      });

      if (res.success) {
        toast.success("Store & delivery settings updated and synced in PostgreSQL database!");
      } else {
        toast.error(res.error || "Failed to save settings");
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[var(--primary)]" />
            <span>Store &amp; Delivery Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            PostgreSQL-persisted shipping charges, delivery zones, Cash on Delivery rules, and branding.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          variant="primary"
          size="md"
          className="gap-2 shadow-sm font-bold"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Settings</span>
        </Button>
      </div>

      {/* 1. Brand & Contact Information */}
      <div className="bg-[var(--surface-elevated)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
        <h2 className="font-heading font-black text-base text-[var(--text-primary)] flex items-center gap-2">
          <Store className="w-4 h-4 text-[var(--primary)]" />
          <span>General Store Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">Store Name</label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">Customer Helpline Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">Support Email</label>
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">Physical Store / Warehouse Address</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Storefront Announcement Banner Text</span>
            </label>
            <Input
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. Cash on Delivery • bKash • Nagad | Hotline & WhatsApp: 01712-039707"
            />
          </div>
        </div>
      </div>

      {/* 2. Cash on Delivery (COD) & Shipping Zones */}
      <div className="bg-[var(--surface-elevated)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
        <h2 className="font-heading font-black text-base text-[var(--text-primary)] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[var(--accent)]" />
          <span>Cash on Delivery Zones &amp; Shipping Charges</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Inside Dhaka Rate (BDT ৳)
            </label>
            <Input
              type="number"
              value={insideDhaka}
              onChange={(e) => setInsideDhaka(e.target.value)}
            />
            <span className="text-[11px] text-[var(--text-muted)]">Standard: ৳60</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Outside Dhaka / Nationwide Rate (BDT ৳)
            </label>
            <Input
              type="number"
              value={outsideDhaka}
              onChange={(e) => setOutsideDhaka(e.target.value)}
            />
            <span className="text-[11px] text-[var(--text-muted)]">Standard: ৳120</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Free Nationwide Delivery Threshold (BDT ৳)
            </label>
            <Input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              Orders with subtotal at or above this receive free shipping (Standard: ৳1,500)
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Gift Wrapping Fee Per Item (BDT ৳)
            </label>
            <Input
              type="number"
              value={giftWrapFee}
              onChange={(e) => setGiftWrapFee(e.target.value)}
            />
            <span className="text-[11px] text-[var(--text-muted)]">Standard: ৳50</span>
          </div>
        </div>
      </div>
    </form>
  );
}
