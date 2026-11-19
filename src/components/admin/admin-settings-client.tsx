"use client";

import { useState, useTransition } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreSettings } from "@/types/store";
import { saveSettings } from "@/server/actions/settings-actions";
import { Settings, Truck, Store, Save, Megaphone, Loader2, CreditCard, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";

interface AdminSettingsClientProps {
  initialSettings: StoreSettings;
}

export function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [storeName, setStoreName] = useState(initialSettings.storeName || siteConfig.name);
  const [legalName, setLegalName] = useState(initialSettings.legalName || siteConfig.name);
  const [phone, setPhone] = useState(initialSettings.hotline || siteConfig.contact.phone);
  const [supportEmail, setSupportEmail] = useState(initialSettings.supportEmail || "");
  const [address, setAddress] = useState(initialSettings.address || "");
  const [tradeLicense, setTradeLicense] = useState(initialSettings.tradeLicense || "");
  const [binNumber, setBinNumber] = useState(initialSettings.binNumber || "");
  const [tinNumber, setTinNumber] = useState(initialSettings.tinNumber || "");

  // Announcement
  const [announcement, setAnnouncement] = useState(initialSettings.announcementText || "");
  const [announcementActive, setAnnouncementActive] = useState(initialSettings.announcementActive ?? false);

  // Delivery settings: string representation preserves empty string as unconfigured (null)
  const [insideDhaka, setInsideDhaka] = useState(
    initialSettings.insideDhakaRate !== null && initialSettings.insideDhakaRate !== undefined
      ? initialSettings.insideDhakaRate.toString()
      : ""
  );
  const [outsideDhaka, setOutsideDhaka] = useState(
    initialSettings.outsideDhakaRate !== null && initialSettings.outsideDhakaRate !== undefined
      ? initialSettings.outsideDhakaRate.toString()
      : ""
  );
  const [expressDhaka, setExpressDhaka] = useState(
    initialSettings.expressDhakaRate !== null && initialSettings.expressDhakaRate !== undefined
      ? initialSettings.expressDhakaRate.toString()
      : ""
  );
  const [freeThreshold, setFreeThreshold] = useState(
    initialSettings.freeShippingThreshold !== null && initialSettings.freeShippingThreshold !== undefined
      ? initialSettings.freeShippingThreshold.toString()
      : ""
  );
  const [giftWrapFee, setGiftWrapFee] = useState(
    initialSettings.giftWrapFee !== null && initialSettings.giftWrapFee !== undefined
      ? initialSettings.giftWrapFee.toString()
      : ""
  );

  // Payment methods
  const [enableCod, setEnableCod] = useState(initialSettings.enableCod ?? true);
  const [enableBkash, setEnableBkash] = useState(initialSettings.enableBkash ?? true);
  const [enableNagad, setEnableNagad] = useState(initialSettings.enableNagad ?? true);
  const [bkashNumber, setBkashNumber] = useState(initialSettings.bkashMerchantNumber || "");
  const [nagadNumber, setNagadNumber] = useState(initialSettings.nagadMerchantNumber || "");
  const [maintenanceMode, setMaintenanceMode] = useState(initialSettings.maintenanceMode ?? false);

  const [isPending, startTransition] = useTransition();

  const parseNullableNumber = (val: string): number | null => {
    const trimmed = val.trim();
    if (trimmed === "") return null;
    const num = Number(trimmed);
    if (isNaN(num) || num < 0) return null;
    return Math.round(num);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const insideRateParsed = parseNullableNumber(insideDhaka);
    const outsideRateParsed = parseNullableNumber(outsideDhaka);
    const expressRateParsed = parseNullableNumber(expressDhaka);
    const freeThresholdParsed = parseNullableNumber(freeThreshold);
    const giftWrapParsed = parseNullableNumber(giftWrapFee);

    startTransition(async () => {
      const res = await saveSettings({
        storeName: storeName.trim() || siteConfig.name,
        legalName: legalName.trim() || siteConfig.name,
        hotline: phone.trim(),
        supportEmail: supportEmail.trim(),
        address: address.trim(),
        tradeLicense: tradeLicense.trim(),
        binNumber: binNumber.trim(),
        tinNumber: tinNumber.trim(),
        announcementText: announcement.trim(),
        announcementActive,
        insideDhakaRate: insideRateParsed,
        outsideDhakaRate: outsideRateParsed,
        expressDhakaRate: expressRateParsed,
        freeShippingThreshold: freeThresholdParsed,
        giftWrapFee: giftWrapParsed,
        shippingConfigured: insideRateParsed !== null && outsideRateParsed !== null,
        enableCod,
        enableBkash,
        enableNagad,
        bkashMerchantNumber: bkashNumber.trim(),
        nagadMerchantNumber: nagadNumber.trim(),
        maintenanceMode,
      });

      if (res.success) {
        toast.success(
          isBn
            ? "স্টোর ও ডেলিভারি সেটিংস সফলভাবে সংরক্ষিত হয়েছে!"
            : "Store & delivery settings updated and persisted successfully!"
        );
      } else {
        toast.error(res.error || (isBn ? "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে" : "Failed to save settings"));
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[var(--primary)]" />
            <span>{isBn ? "স্টোর ও ডেলিভারি সেটিংস" : "Store & Delivery Settings"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {isBn
              ? "ডেলিভারি চার্জ, ক্যাশ অন ডেলিভারি এবং পেমেন্ট সেটিংস কনফিগারেশন।"
              : "PostgreSQL-persisted delivery charges, cash on delivery rules, and payment settings."}
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
          <span>{isBn ? "সকল সেটিংস সংরক্ষণ করুন" : "Save All Settings"}</span>
        </Button>
      </div>

      {/* 1. Brand & Contact Information */}
      <div className="bg-[var(--surface-elevated)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
        <h2 className="font-heading font-black text-base text-[var(--text-primary)] flex items-center gap-2">
          <Store className="w-4 h-4 text-[var(--primary)]" />
          <span>{isBn ? "সাধারণ স্টোর তথ্য" : "General Store Details"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "স্টোরের নাম" : "Store Name"}
            </label>
            <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "আইনি সত্তার নাম" : "Legal Entity Name"}
            </label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "কাস্টমার হেল্পলাইন ফোন" : "Customer Helpline Phone"}
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01712-039707" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "সাপোর্ট ইমেইল" : "Support Email"}
            </label>
            <Input
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="e.g. support@khelnabazar.com.bd"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "স্টোর / গুদাম ঠিকানা" : "Store / Warehouse Address"}
            </label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "ট্রেড লাইসেন্স নম্বর" : "Trade License Number"}
            </label>
            <Input value={tradeLicense} onChange={(e) => setTradeLicense(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "বিআইএন / টিআইএন নম্বর" : "BIN / TIN Number"}
            </label>
            <Input value={binNumber} onChange={(e) => setBinNumber(e.target.value)} placeholder="BIN Number" />
          </div>

          <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{isBn ? "স্টোরফ্রন্ট ঘোষণা ব্যানার" : "Storefront Announcement Banner"}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span>{isBn ? "সক্রিয় রাখুন" : "Active"}</span>
              </label>
            </div>
            <Input
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. Cash on Delivery • bKash • Nagad | Hotline: 01712-039707"
            />
          </div>
        </div>
      </div>

      {/* 2. Cash on Delivery (COD) & Shipping Zones */}
      <div className="bg-[var(--surface-elevated)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
        <h2 className="font-heading font-black text-base text-[var(--text-primary)] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[var(--accent)]" />
          <span>{isBn ? "ডেলিভারি চার্জ ও জোন সেটিংস" : "Delivery Charges & Zone Settings"}</span>
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          {isBn
            ? "খালি রাখলে রেট অপ্রস্তুত (Unconfigured) থাকবে। কোনো অনুমিত বা ডিফল্ট মান প্রয়োগ হবে না।"
            : "Leave empty to mark unconfigured. No guessed or hidden default rates will be applied."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "ঢাকা সিটির ভেতরে ডেলিভারি চার্জ (টাকা)" : "Inside Dhaka Delivery Rate (BDT ৳)"}
            </label>
            <Input
              type="number"
              min="0"
              value={insideDhaka}
              onChange={(e) => setInsideDhaka(e.target.value)}
              placeholder={isBn ? "যেমন: ৬০ (খালি রাখলে অসংজ্ঞায়িত)" : "e.g. 60 (leave empty for unconfigured)"}
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              {insideDhaka.trim() === ""
                ? isBn ? "বর্তমানে অপ্রস্তুত (অর্ডার ব্লক থাকবে)" : "Currently unconfigured (orders blocked)"
                : `৳${insideDhaka}`}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "ঢাকার বাইরে ডেলিভারি চার্জ (টাকা)" : "Outside Dhaka Delivery Rate (BDT ৳)"}
            </label>
            <Input
              type="number"
              min="0"
              value={outsideDhaka}
              onChange={(e) => setOutsideDhaka(e.target.value)}
              placeholder={isBn ? "যেমন: ১২০ (খালি রাখলে অসংজ্ঞায়িত)" : "e.g. 120 (leave empty for unconfigured)"}
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              {outsideDhaka.trim() === ""
                ? isBn ? "বর্তমানে অপ্রস্তুত (অর্ডার ব্লক থাকবে)" : "Currently unconfigured (orders blocked)"
                : `৳${outsideDhaka}`}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "এক্সপ্রেস ডেলিভারি চার্জ (ঐচ্ছিক)" : "Express Dhaka Delivery Rate (Optional)"}
            </label>
            <Input
              type="number"
              min="0"
              value={expressDhaka}
              onChange={(e) => setExpressDhaka(e.target.value)}
              placeholder={isBn ? "যেমন: ১৫০ (খালি রাখলে নিষ্ক্রিয়)" : "e.g. 150 (leave empty to disable)"}
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              {expressDhaka.trim() === "" ? (isBn ? "নিষ্ক্রিয়" : "Disabled") : `৳${expressDhaka}`}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "ফ্রি শিপিং নূন্যতম মূল্য (ঐচ্ছিক)" : "Free Shipping Threshold (Optional)"}
            </label>
            <Input
              type="number"
              min="0"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              placeholder={isBn ? "যেমন: ১৫০০ (খালি রাখলে নিষ্ক্রিয়)" : "e.g. 1500 (leave empty to disable)"}
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              {freeThreshold.trim() === "" ? (isBn ? "নিষ্ক্রিয়" : "Disabled") : `৳${freeThreshold}`}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              {isBn ? "গিফট র্যাপিং ফি (ঐচ্ছিক)" : "Gift Wrapping Fee Per Item (Optional)"}
            </label>
            <Input
              type="number"
              min="0"
              value={giftWrapFee}
              onChange={(e) => setGiftWrapFee(e.target.value)}
              placeholder={isBn ? "যেমন: ৫০ (খালি রাখলে নিষ্ক্রিয়)" : "e.g. 50 (leave empty to disable)"}
            />
            <span className="text-[11px] text-[var(--text-muted)]">
              {giftWrapFee.trim() === "" ? (isBn ? "নিষ্ক্রিয়" : "Disabled") : `৳${giftWrapFee}`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Payment Methods & Gateway Configuration */}
      <div className="bg-[var(--surface-elevated)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] space-y-4 shadow-sm">
        <h2 className="font-heading font-black text-base text-[var(--text-primary)] flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[var(--primary)]" />
          <span>{isBn ? "পেমেন্ট মাধ্যম কনফিগারেশন" : "Payment Methods Configuration"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Cash on Delivery (COD)</p>
              <p className="text-[11px] text-[var(--text-muted)]">Pay upon inspection at delivery</p>
            </div>
            <input
              type="checkbox"
              checked={enableCod}
              onChange={(e) => setEnableCod(e.target.checked)}
              className="rounded border-[var(--border)] text-[var(--primary)]"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">bKash Manual Verification</p>
              <p className="text-[11px] text-[var(--text-muted)]">Sender number &amp; TrxID required</p>
            </div>
            <input
              type="checkbox"
              checked={enableBkash}
              onChange={(e) => setEnableBkash(e.target.checked)}
              className="rounded border-[var(--border)] text-[var(--primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">bKash Receiving Number</label>
            <Input value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">Nagad Receiving Number</label>
            <Input value={nagadNumber} onChange={(e) => setNagadNumber(e.target.value)} />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {isBn ? "রক্ষণাবেক্ষণ মোড (Maintenance Mode)" : "Maintenance Mode"}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isBn ? "সক্রিয় থাকলে গ্রাহকরা অর্ডার দিতে পারবেন না" : "When active, customers cannot place orders"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="rounded border-[var(--border)] text-amber-600"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
