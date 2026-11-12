import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  loyaltyPoints: number;
  tier: "BRONZE" | "SILVER" | "GOLD";
}

interface AuthState {
  user: UserSession | null;
  login: (email: string, role?: "CUSTOMER" | "STAFF" | "ADMIN", name?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: "demo-cust-1",
        name: "Tanzim Ahmed",
        email: "customer@khelnabazar.com",
        role: "CUSTOMER",
        loyaltyPoints: 350,
        tier: "BRONZE",
      }, // Pre-populated with customer demo for immediate joyful testing

      login: (identifier, role = "CUSTOMER", name) => {
        const cleanId = (identifier || "").trim().toLowerCase();
        let assignedRole: "CUSTOMER" | "STAFF" | "ADMIN" = role;
        let assignedName = name || identifier.split("@")[0] || "Valued Customer";
        let points = 100;
        let tier: "BRONZE" | "SILVER" | "GOLD" = "BRONZE";

        if (cleanId.includes("admin") || cleanId === "owner") {
          assignedRole = "ADMIN";
          assignedName = "Khelna Bazar Owner";
          points = 5000;
          tier = "GOLD";
        } else if (cleanId.includes("staff")) {
          assignedRole = "STAFF";
          assignedName = "Operations Manager";
          points = 1200;
          tier = "SILVER";
        }

        set({
          user: {
            id: `usr-${Date.now()}`,
            name: assignedName,
            email: identifier.includes("@") ? identifier : `${identifier}@khelnabazar.com`,
            role: assignedRole,
            loyaltyPoints: points,
            tier,
          },
        });
      },

      logout: () => set({ user: null }),

      isAuthenticated: () => Boolean(get().user),

      isAdmin: () => get().user?.role === "ADMIN",
    }),
    {
      name: "khelna_bazar_session_v1",
    }
  )
);
