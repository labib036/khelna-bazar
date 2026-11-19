import { AdminLayout } from "@/components/admin/admin-layout";
import { requireStaff } from "@/lib/authorization-guards";

export const metadata = {
  title: "Admin Management Console | Khelna Bazar",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireStaff("/admin/dashboard");
  return <AdminLayout>{children}</AdminLayout>;
}
