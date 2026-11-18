import { Metadata } from "next";
import { AdminAuditLogsClient } from "@/components/admin/admin-audit-logs-client";

export const metadata: Metadata = {
  title: "Audit Logs | Admin Console - Khelna Bazar",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAuditLogsPage() {
  return <AdminAuditLogsClient />;
}
