"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export function PhoneInput({
  value,
  onChange,
  label = "Mobile Number (মোবাইল নম্বর)",
  error,
  placeholder = "01712 345678",
  disabled = false,
  required = false,
  className,
  id,
}: PhoneInputProps) {
  const inputId = id || "bd-phone-input";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.startsWith("880")) {
      raw = raw.slice(3);
    }
    if (raw.length > 11) {
      raw = raw.slice(0, 11);
    }
    onChange(raw);
  };

  const isValidBdPhone = /^01[3-9]\d{8}$/.test(value.replace(/\D/g, ""));

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-[var(--text-primary)]">
          {label} {required && <span className="text-[var(--danger)]">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Country Code Prefix Pill */}
        <div className="absolute left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-muted)] select-none pointer-events-none">
          <span>🇧🇩</span>
          <span>+880</span>
        </div>

        <input
          id={inputId}
          type="tel"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "flex h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-24 pr-10 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 font-mono tracking-wide",
            error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20",
            isValidBdPhone && !error && "border-[var(--success)]/60 focus:border-[var(--success)]",
            className
          )}
        />

        {/* Validation Status Indicator */}
        <div className="absolute right-3.5 flex items-center pointer-events-none">
          {isValidBdPhone && !error ? (
            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
          ) : error ? (
            <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
          ) : (
            <Phone className="w-4 h-4 text-[var(--text-muted)] opacity-50" />
          )}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-[var(--danger)] font-medium">{error}</p>
      ) : (
        <p className="text-[11px] text-[var(--text-muted)]">
          Enter 11-digit mobile number (e.g. 017XXXXXXXX)
        </p>
      )}
    </div>
  );
}
