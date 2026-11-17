import { create } from "zustand";
import { persist } from "zustand/middleware";
import { siteConfig } from "@/config/site";
import { calculateDeliveryFee } from "@/lib/utils";
import { validateCouponAction } from "@/server/actions/coupon-actions";

export const SHIPPING_CONFIG = {
  freeShippingThreshold: siteConfig.shippingDefaults.freeShippingThreshold,
  insideDhakaRate: siteConfig.shippingDefaults.insideDhakaRate,
  outsideDhakaRate: siteConfig.shippingDefaults.outsideDhakaRate,
  expressDhakaRate: siteConfig.shippingDefaults.expressDhakaRate,
};

export interface CartItem {
  id: string; // Composite unique key e.g. "prod1-var1"
  productId: string;
  variantId: string;
  name: string;
  title: string; // Variant title e.g. "Standard" or "Rainbow 102 Pcs"
  price: number;
  comparePrice?: number | null;
  image: string;
  sku: string;
  quantity: number;
  giftWrap: boolean;
  giftMessage?: string;
  maxStock: number;
}

export interface AppliedCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Mini-cart drawer open/close
  coupon: AppliedCoupon | null;
  deliveryZone: "inside_dhaka" | "outside_dhaka" | "express_dhaka";
  lastRemovedItem: CartItem | null;

  // Actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity" | "giftWrap">, quantity?: number) => void;
  removeItem: (id: string) => void;
  restoreLastRemovedItem: () => void;
  undoRemove: () => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  toggleGiftWrap: (id: string) => void;
  setGiftMessage: (id: string, message: string) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setDeliveryZone: (zone: "inside_dhaka" | "outside_dhaka" | "express_dhaka") => void;
  clearCart: () => void;

  // Computed Getters
  getSubtotal: () => number;
  getDiscount: () => number;
  getShippingFee: () => number;
  getGiftWrapFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getFreeShippingRemaining: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,
      deliveryZone: "inside_dhaka",
      lastRemovedItem: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (itemData, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === itemData.productId && i.variantId === itemData.variantId
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            const currentItem = newItems[existingIndex];
            const newQty = Math.min(currentItem.quantity + quantity, currentItem.maxStock || 99);
            newItems[existingIndex] = { ...currentItem, quantity: newQty };
            return { items: newItems, isOpen: true };
          }

          const newItem: CartItem = {
            ...itemData,
            quantity: Math.max(1, quantity),
            giftWrap: false,
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const itemToRemove = state.items.find((i) => i.id === id) || null;
          return {
            items: state.items.filter((i) => i.id !== id),
            lastRemovedItem: itemToRemove,
          };
        });
      },

      restoreLastRemovedItem: () => {
        set((state) => {
          if (!state.lastRemovedItem) return state;
          return {
            items: [...state.items, state.lastRemovedItem],
            lastRemovedItem: null,
          };
        });
      },

      undoRemove: () => {
        get().restoreLastRemovedItem();
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const newItems = state.items
            .map((item) => {
              if (item.id === id) {
                const updatedQty = item.quantity + delta;
                if (updatedQty <= 0) return null;
                return { ...item, quantity: Math.min(updatedQty, item.maxStock || 99) };
              }
              return item;
            })
            .filter(Boolean) as CartItem[];

          return { items: newItems };
        });
      },

      setQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(quantity, i.maxStock || 99) } : i
            ),
          };
        });
      },

      toggleGiftWrap: (id) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, giftWrap: !i.giftWrap } : i)),
        }));
      },

      setGiftMessage: (id, message) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, giftMessage: message } : i)),
        }));
      },

      applyCoupon: async (code) => {
        const cleanCode = (code || "").trim().toUpperCase();
        const subtotal = get().getSubtotal();

        if (subtotal === 0) {
          return { success: false, message: "Your cart is empty." };
        }
        if (!cleanCode) {
          return { success: false, message: "Please enter a coupon code." };
        }

        try {
          const res = await validateCouponAction(cleanCode, subtotal, get().getShippingFee());
          if (res.success && res.coupon) {
            set({
              coupon: {
                code: res.coupon.code,
                type: res.coupon.type as any,
                value: res.coupon.value,
                discountAmount: res.coupon.discountAmount,
              },
            });
            return { success: true, message: res.message };
          }
          return { success: false, message: res.message || "Invalid coupon code." };
        } catch (err: any) {
          return { success: false, message: err.message || "Could not validate coupon." };
        }
      },

      removeCoupon: () => set({ coupon: null }),

      setDeliveryZone: (zone) => set({ deliveryZone: zone }),

      clearCart: () => set({ items: [], coupon: null }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: () => {
        const { coupon } = get();
        if (!coupon) return 0;
        return coupon.discountAmount;
      },

      getShippingFee: () => {
        const { deliveryZone, coupon } = get();
        if (coupon?.type === "FREE_SHIPPING") return 0;
        return calculateDeliveryFee(deliveryZone, get().getSubtotal());
      },

      getGiftWrapFee: () => {
        return 0; // Gift wrap fee hidden until approved
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const shipping = get().getShippingFee();
        const giftWrap = get().getGiftWrapFee();
        return Math.max(0, subtotal - discount + shipping + giftWrap);
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getFreeShippingRemaining: () => {
        const threshold = siteConfig.shippingDefaults.freeShippingThreshold;
        if (threshold <= 0) return 0;
        const subtotal = get().getSubtotal();
        return Math.max(0, threshold - subtotal);
      },
    }),
    {
      name: "khelna_bazar_cart_v1",
      partialize: (state) => ({
        items: state.items,
        deliveryZone: state.deliveryZone,
        coupon: state.coupon,
      }),
    }
  )
);
