import { getStoreSettings } from "@/server/services/settings-service";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";
import { getCurrentUser, isAdminRole } from "@/lib/authorization-guards";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings — Admin Panel | Khelna Bazar",
};

export default async function AdminSettingsPage() {
  const actor = await getCurrentUser();
  if (!actor || !isAdminRole(actor.role)) {
    redirect("/admin/login");
  }

  const settings = await getStoreSettings();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
