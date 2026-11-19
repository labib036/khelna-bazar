"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Shield,
  ShieldAlert,
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStaffUsersAction,
  createStaffUserAction,
  updateStaffRoleAction,
  revokeUserSessionsAction,
  StaffRole,
} from "@/server/actions/admin-staff-actions";

interface StaffUser {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: Date | string;
  blocked: boolean;
}

export function AdminStaffClient() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // New staff form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("STAFF");
  const [password, setPassword] = useState("KhelnaStaff2026!");

  const fetchStaff = async () => {
    setLoading(true);
    const res = await getStaffUsersAction();
    if (res.success && res.users) {
      setUsers(res.users);
    } else {
      toast.error(res.error || "Failed to load staff list");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    startTransition(async () => {
      const res = await createStaffUserAction({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        password: password.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Staff user "${name}" successfully created with role ${role}!`);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("KhelnaStaff2026!");
        setShowAddForm(false);
        await fetchStaff();
      } else {
        toast.error(res.error || "Failed to provision staff account");
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: StaffRole) => {
    startTransition(async () => {
      const res = await updateStaffRoleAction(userId, newRole);
      if (res.success) {
        toast.success("User role updated successfully");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(res.error || "Failed to update role");
      }
    });
  };

  const handleRevokeSessions = async (userId: string, memberName: string) => {
    startTransition(async () => {
      const res = await revokeUserSessionsAction(userId);
      if (res.success) {
        toast.success(`Revoked all active sessions for ${memberName}.`);
      } else {
        toast.error(res.error || "Failed to revoke sessions.");
      }
    });
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            SUPER ADMIN
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            ADMIN
          </span>
        );
      case "STAFF":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            STAFF
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl" data-testid="admin-staff-directory">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-600" />
            Staff & Role Management
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Restricted to Super Admin. Manage internal personnel, roles, and administrative capabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStaff}
            disabled={loading || isPending}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <UserPlus className="w-4 h-4" />
            {showAddForm ? "Close Form" : "Add Staff Member"}
          </Button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Super Administrator Access Zone</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Role elevations grant elevated permissions to sensitive customer data, orders, and financial transactions. All role changes are permanently recorded in the audit log.
          </p>
        </div>
      </div>

      {/* Provision Staff Collapsible Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-600" />
              Provision New Internal Staff
            </h3>
            <span className="text-xs text-gray-400">Password will be provided or defaulted</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <Input
                placeholder="e.g. Tanvir Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Work Email *
              </label>
              <Input
                type="email"
                placeholder="e.g. tanvir@khelnabazar.com.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Contact Phone (Optional)
              </label>
              <Input
                placeholder="e.g. 01712039707"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Assign Role *
              </label>
              <select
                aria-label="Assign Role"
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
              >
                <option value="STAFF">STAFF (Orders, Shipping, Payment Review)</option>
                <option value="ADMIN">ADMIN (Products, Coupons, Store Settings)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Root Access + Staffing)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Temporary Password
              </label>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Default: KhelnaStaff2026!"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide this password to the employee. They should change it upon first login.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Staff Account
            </Button>
          </div>
        </form>
      )}

      {/* Staff Directory Table */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="font-heading font-bold text-base text-[var(--text-primary)]">
              Internal Personnel ({users.length})
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Authorized users with elevated roles
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
            <p className="text-sm">Loading staff directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No staff accounts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">
                        {staff.name || "Unnamed Staff"}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {staff.email}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {staff.phone ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone className="w-3 h-3 text-gray-400" />
                          {staff.phone}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Not recorded</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {getRoleBadge(staff.role)}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(staff.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <select
                          aria-label="Change role for this staff member"
                          className="h-8 px-2 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={staff.role}
                          disabled={isPending}
                          onChange={(e) =>
                            handleRoleChange(staff.id, e.target.value as StaffRole)
                          }
                        >
                          <option value="STAFF">STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-[11px] text-amber-600 border-amber-300 hover:bg-amber-50"
                          disabled={isPending}
                          onClick={() => handleRevokeSessions(staff.id, staff.name || staff.email || "User")}
                          title="Revoke all active JWT sessions immediately"
                        >
                          Sign Out Everywhere
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
