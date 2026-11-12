import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { siteConfig } from "@/config/site";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount in Bangladeshi Taka (৳)
 * Example: formatPrice(1250) -> "৳1,250"
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));

  return `${siteConfig.localization.currencySymbol}${formatted}`;
}

/**
 * Calculate discount percentage between original price and sale price
 */
export function calculateDiscountPercentage(basePrice: number, comparePrice?: number | null): number {
  if (!comparePrice || comparePrice <= basePrice) return 0;
  return Math.round(((comparePrice - basePrice) / comparePrice) * 100);
}

/**
 * Calculate delivery fee based on zone and subtotal (Free over threshold)
 */
export function calculateDeliveryFee(zone: string, subtotal: number): number {
  if (subtotal >= siteConfig.shippingDefaults.freeShippingThreshold) {
    return 0; // Free delivery
  }

  if (zone.toLowerCase().includes("outside") || zone.toLowerCase().includes("nationwide")) {
    return siteConfig.shippingDefaults.outsideDhakaRate; // ৳120
  }

  if (zone.toLowerCase().includes("express")) {
    return siteConfig.shippingDefaults.expressDhakaRate; // ৳150
  }

  return siteConfig.shippingDefaults.insideDhakaRate; // ৳60 (Standard Inside Dhaka)
}

/**
 * Generates an accessible, human-readable Order Number (e.g. KB-108429)
 */
export function generateOrderNumber(): string {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `KB-${randomSixDigits}`;
}

/**
 * Truncate text cleanly
 */
export function truncate(str: string, length: number): string {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Format date in pleasant local format
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
