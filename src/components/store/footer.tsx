"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowUp,
  Send,
} from "lucide-react";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes("@")) {
      setNewsletterSuccess(true);
      setNewsletterEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#18191F] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Value Props & Trust Badges Strip (Confirmed by Owner) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-[var(--primary-fixed)] text-[var(--primary)] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">Inspect Before You Accept</h4>
              <p className="text-xs text-slate-400 mt-0.5">Check your toy in front of the delivery person before accepting.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">Defective? We Refund</h4>
              <p className="text-xs text-slate-400 mt-0.5">Full refund for defective products reported at delivery.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">Cash on Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Pay in cash when you receive your order.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">Order Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Call or WhatsApp 01712-039707</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info & Contact */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white p-0.5 shrink-0 shadow-sm border border-[#DC012B]/40 movable-logo">
                <Image
                  src="/images/khelna-bazar-logo.png"
                  alt="Khelna Bazar Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl text-white leading-none">
                  KHELNA <span className="text-[#DC012B]">BAZAR</span>
                </span>
                <span className="text-[9px] font-bold tracking-widest text-[#DC012B] uppercase mt-0.5">
                  khelnabazar.com.bd
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The fastest, most joyful toy shopping experience in Bangladesh. Every product is handpicked to nurture
              curiosity, physical coordination, and endless smiles.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              {siteConfig.contact.phone && (
                <a href={`tel:${siteConfig.contact.whatsapp}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">Hotline: {siteConfig.contact.phone}</span>
                </a>
              )}
              {siteConfig.contact.whatsapp && (
                <a href={`https://wa.me/88${siteConfig.contact.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">W</span>
                  <span className="font-semibold text-white">WhatsApp: {siteConfig.contact.whatsappDisplay || siteConfig.contact.phone}</span>
                </a>
              )}
              {siteConfig.contact.email ? (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--primary)]" />
                  <span>{siteConfig.contact.email}</span>
                </div>
              ) : null}
              {siteConfig.contact.address ? (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                  <span>{siteConfig.contact.address}</span>
                </div>
              ) : null}
              {siteConfig.contact.hours ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--tertiary)]" />
                  <span>{siteConfig.contact.hours}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Quick Shop Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white">Popular Departments</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/c/building-blocks" className="hover:text-[#FFC93C] transition-colors">
                  Building Blocks & Bricks
                </Link>
              </li>
              <li>
                <Link href="/c/stem-science" className="hover:text-[#FFC93C] transition-colors">
                  STEM & Science Kits
                </Link>
              </li>
              <li>
                <Link href="/c/rc-vehicles" className="hover:text-[#FFC93C] transition-colors">
                  RC Cars & Drones
                </Link>
              </li>
              <li>
                <Link href="/c/baby-toddler" className="hover:text-[#FFC93C] transition-colors">
                  Baby & Toddler Montessori
                </Link>
              </li>
              <li>
                <Link href="/c/plush-toys" className="hover:text-[#FFC93C] transition-colors">
                  Plush & Teddy Bears
                </Link>
              </li>
              <li>
                <Link href="/c/board-games-puzzles" className="hover:text-[#FFC93C] transition-colors">
                  Family Board Games
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-[#FF6B6B] hover:underline font-semibold">
                  Today's Flash Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white">Customer Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-[#DC012B] transition-colors">
                  Track Delivery Order
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping-policy" className="hover:text-[#DC012B] transition-colors">
                  Cash on Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/pages/return-refund-policy" className="hover:text-[#DC012B] transition-colors">
                  Delivery Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/about-us" className="hover:text-[#DC012B] transition-colors">
                  About Khelna Bazar
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy-policy" className="hover:text-[#DC012B] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/pages/terms" className="hover:text-[#DC012B] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Helpline & Verification */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-sm text-white">Direct Order &amp; Helpline</h4>
            <p className="text-xs text-slate-400">
              For order confirmations, delivery status, or toy advice, call or WhatsApp our hotline directly:
            </p>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Phone className="w-4 h-4 text-amber-400" />
                <a href="tel:01712039707" className="hover:text-[#DC012B] transition-colors">
                  01712-039707
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Payment via Cash on Delivery, bKash, or Nagad (01712-039707).
              </p>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Inspect product in front of the courier before accepting.</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} KHELNA BAZAR. All rights reserved. Crafted with care for parents & kids in Bangladesh.</p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-slate-300 font-semibold border border-slate-800">
              <Truck className="w-3.5 h-3.5 text-[#2EC4B6]" />
              <span>Cash on Delivery Partner</span>
            </span>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
