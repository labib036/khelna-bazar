import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="auth-shell" className="min-h-screen flex flex-col justify-between bg-[var(--surface-container-low)]">
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-[var(--border)] shadow-xs bg-white">
            <Image
              src="/images/khelna-bazar-logo.png"
              alt="Khelna Bazar"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <span className="font-heading font-black text-lg text-[var(--text-primary)]">
            Khelna <span className="text-[var(--primary)]">Bazar</span>
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors px-3 py-1.5 rounded-full hover:bg-[var(--surface)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children}
      </main>

      <footer className="p-4 sm:p-6 text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
        <p>&copy; {new Date().getFullYear()} Khelna Bazar (খেলনা বাজার) &bull; Verified Cash on Delivery</p>
      </footer>
    </div>
  );
}
