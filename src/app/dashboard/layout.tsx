import { CustomerDashboardShell } from "@/components/customer/customer-dashboard-shell";

export const metadata = {
  title: "Customer Dashboard | Khelna Bazar",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerDashboardShell>{children}</CustomerDashboardShell>;
}
