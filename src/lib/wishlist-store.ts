import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image: string;
  ratingAvg: number;
  ratingCount: number;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleWishlist: (item: Omit<WishlistItem, "addedAt">) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== item.productId),
          }));
          return false;
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                ...item,
                addedAt: new Date().toISOString(),
              },
            ],
          }));
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      clearWishlist: () => set({ items: [] }),

      getCount: () => get().items.length,
    }),
    {
      name: "khelna_bazar_wishlist_v1",
    }
  )
);
