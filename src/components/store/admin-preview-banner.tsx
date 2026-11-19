import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";

export async function AdminPreviewBanner() {
  const session = await auth();
  const user = session?.user;
  const isPrivileged =
    user?.role === "STAFF" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  if (!isPrivileged) return null;

  return (
    <aside
      aria-label="Admin Storefront Preview Bar"
      className="bg-[#18191F] text-white px-4 py-2 text-xs font-medium flex items-center justify-between border-b border-slate-800 sticky top-0 z-50 shadow-md"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate">
          <strong className="text-white">Admin Preview:</strong> You are viewing the storefront as{" "}
          <span className="text-amber-300 font-bold uppercase">{user.role}</span> ({user.name || user.email}).
        </span>
      </div>
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors shrink-0 shadow-xs ml-3"
      >
        <span>Console</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </aside>
  );
}
