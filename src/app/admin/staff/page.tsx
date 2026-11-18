import { Metadata } from "next";
import { AdminStaffClient } from "@/components/admin/admin-staff-client";

export const metadata: Metadata = {
  title: "Staff & Role Management | Admin Console - Khelna Bazar",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminStaffPage() {
  return <AdminStaffClient />;
}
