import { CustomerDashboardShell } from "@/components/customer/customer-dashboard-shell";
import { requireCustomer } from "@/lib/authorization-guards";
import { getPublicStoreSettings } from "@/server/services/settings-service";

export const metadata = {
  title: "Customer Dashboard | Khelna Bazar",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomer("/dashboard");
  const settings = await getPublicStoreSettings();
  return (
    <CustomerDashboardShell hotline={settings?.hotline || ""}>
      {children}
    </CustomerDashboardShell>
  );
}
