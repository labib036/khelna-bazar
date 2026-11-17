"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] p-8 text-center space-y-6 shadow-lg">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-[var(--danger)] flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-black text-[var(--text-primary)]">
            Oops! A Toy Got Tangled
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            We ran into an unexpected hiccup loading this page. Our team has been notified. You can try refreshing or return to the store.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            onClick={() => reset()}
            variant="primary"
            size="md"
            className="w-full sm:w-auto gap-2 font-bold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full gap-2 font-bold">
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </Button>
          </Link>
        </div>

        {siteConfig.contact.hotline && (
          <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            Need urgent assistance? Call our hotline:{" "}
            <a href={`tel:${siteConfig.contact.hotline}`} className="font-bold text-[var(--primary)] hover:underline">
              {siteConfig.contact.hotline}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
