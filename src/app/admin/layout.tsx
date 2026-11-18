import { AdminLayout } from "@/components/admin/admin-layout";

export const metadata = {
  title: "Admin Management Console | Khelna Bazar",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
