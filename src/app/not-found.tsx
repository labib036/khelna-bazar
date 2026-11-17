import Link from "next/link";
import { siteConfig } from "@/config/site";
import { NotFoundIllustration } from "@/components/ui/illustrations";
import { Search, Home, Gift, Package, ArrowRight, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-orange-50/50 via-background to-background dark:from-orange-950/20">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Playful Illustration */}
        <div className="flex justify-center">
          <NotFoundIllustration className="w-48 h-48 drop-shadow-md" />
        </div>

        {/* Heading & Copy */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" /> 404 - Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-[var(--text-primary)]">
            Oops! This Toy Wandered Away
          </h1>
          <p className="text-base text-[var(--text-muted)] max-w-md mx-auto">
            The page you are looking for might have been moved, renamed, or is currently taking a nap in the toy box.
          </p>
          <p className="text-sm text-[var(--primary)] font-bold">
            (পৃষ্ঠাটি খুঁজে পাওয়া যায়নি বা অন্য কোথাও সরানো হয়েছে)
          </p>
        </div>

        {/* Quick Search Shortcut */}
        <form
          action="/c/all"
          method="GET"
          className="relative max-w-md mx-auto flex items-center shadow-sm rounded-full overflow-hidden border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20 bg-[var(--surface)]"
        >
          <Search className="w-5 h-5 ml-4 text-[var(--text-muted)] shrink-0" />
          <input
            type="search"
            name="q"
            placeholder="Search toys, board games, STEM kits..."
            className="w-full px-3 py-3 text-sm bg-transparent outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <button
            type="submit"
            className="m-1 px-5 py-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm shadow-md hover:bg-[var(--primary-hover)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/c/all"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] font-bold text-sm hover:bg-[var(--border)] transition-all"
          >
            Browse All Toys
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Secondary Helpful Links */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
          <Link href="/gift-finder" className="inline-flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors">
            <Gift className="w-3.5 h-3.5" /> Age Gift Finder
          </Link>
          <span className="text-[var(--border)]">•</span>
          <Link href="/track-order" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <Package className="w-3.5 h-3.5" /> Track Your Order
          </Link>
          {siteConfig.contact.hotline && (
            <>
              <span className="text-border">•</span>
              <a href={`tel:${siteConfig.contact.hotline}`} className="hover:text-primary transition-colors">
                Support: {siteConfig.contact.hotline}
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
