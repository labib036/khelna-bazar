import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  ratingAvg: number;
  ratingCount: number;
  minAgeMonths: number;
  maxAgeMonths: number;
  material?: string | null;
  batteryInfo?: string | null;
  chokingHazard: boolean;
  brandName?: string | null;
  categoryName?: string | null;
}

interface CompareState {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => { success: boolean; message: string };
  removeProduct: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        const current = get().products;
        if (current.some((p) => p.id === product.id)) {
          return { success: false, message: "Toy is already in comparison table." };
        }
        if (current.length >= 4) {
          return { success: false, message: "You can compare up to 4 toys at a time." };
        }
        set({ products: [...current, product] });
        return { success: true, message: `Added ${product.name} to comparison!` };
      },

      removeProduct: (productId) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        }));
      },

      clearCompare: () => set({ products: [] }),

      isInCompare: (productId) => {
        return get().products.some((p) => p.id === productId);
      },
    }),
    {
      name: "khelna_bazar_compare_v1",
    }
  )
);
