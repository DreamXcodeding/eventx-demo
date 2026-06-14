// cartStore — ตะกร้าจองบัตร (persist กัน reload หาย) · ใช้ใน flow จองบัตร
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  eventId: string;
  eventSlug?: string; // slug ของอีเวนต์ (ใช้ตอนสร้าง order จริงผ่าน API)
  eventTitle: string;
  eventImage?: string; // รูปอีเวนต์ (โปสเตอร์) สำหรับโชว์บนการ์ดบัตร
  ticketTypeId: string;
  ticketName: string;
  sessionId?: string;
  sessionLabel?: string;
  unitPrice: number; // บาท
  quantity: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (ticketTypeId: string) => void;
  setQuantity: (ticketTypeId: string, quantity: number) => void;
  setCoupon: (code: string | null) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.ticketTypeId === item.ticketTypeId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.ticketTypeId === item.ticketTypeId ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...s.items, item] };
        }),
      removeItem: (ticketTypeId) => set((s) => ({ items: s.items.filter((i) => i.ticketTypeId !== ticketTypeId) })),
      setQuantity: (ticketTypeId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.ticketTypeId === ticketTypeId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      setCoupon: (code) => set({ couponCode: code }),
      clear: () => set({ items: [], couponCode: null }),
      count: () => get().items.reduce((n, i) => n + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    { name: "ecn-cart" }
  )
);
