import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  subtotal: number;
  discount: { value: number; percent: number };
  tax: { value: number; percent: number };
  total: number;
  paymentMethod: string;
  notes: string;

  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discountValue?: number, discountPercent?: number) => void;
  setDiscount: (value?: number, percent?: number) => void;
  setTax: (value?: number, percent?: number) => void;
  setPaymentMethod: (method: string) => void;
  setNotes: (notes: string) => void;
  calculateTotals: () => void;
  clear: () => void;
  getTotal: () => number;
  getChange: (paid: number) => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  subtotal: 0,
  discount: { value: 0, percent: 0 },
  tax: { value: 0, percent: 0 },
  total: 0,
  paymentMethod: 'cash',
  notes: '',

  addItem: (product: Product, quantity: number) => {
    set((state) => {
      const existingItem = state.items.find(item => item.product_id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        state.items.push({
          product_id: product.id,
          product,
          quantity,
          price: product.price_sell,
          subtotal: quantity * product.price_sell,
          discount_value: 0,
          discount_percent: 0
        });
      }

      get().calculateTotals();
      return { items: [...state.items] };
    });
  },

  removeItem: (productId: string) => {
    set((state) => {
      const filtered = state.items.filter(item => item.product_id !== productId);
      set({ items: filtered });
      get().calculateTotals();
      return {};
    });
  },

  updateItemQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => {
      const item = state.items.find(i => i.product_id === productId);
      if (item && item.product) {
        item.quantity = quantity;
        item.subtotal = quantity * item.product.price_sell;
      }
      get().calculateTotals();
      return { items: [...state.items] };
    });
  },

  updateItemDiscount: (productId: string, discountValue?: number, discountPercent?: number) => {
    set((state) => {
      const item = state.items.find(i => i.product_id === productId);
      if (item) {
        if (discountValue !== undefined) {
          item.discount_value = discountValue;
        }
        if (discountPercent !== undefined) {
          item.discount_percent = discountPercent;
          item.discount_value = (item.subtotal * discountPercent) / 100;
        }
      }
      get().calculateTotals();
      return { items: [...state.items] };
    });
  },

  setDiscount: (value?: number, percent?: number) => {
    set((state) => {
      if (value !== undefined) {
        state.discount.value = value;
      }
      if (percent !== undefined) {
        state.discount.percent = percent;
        state.discount.value = (state.subtotal * percent) / 100;
      }
      get().calculateTotals();
      return {};
    });
  },

  setTax: (value?: number, percent?: number) => {
    set((state) => {
      if (value !== undefined) {
        state.tax.value = value;
      }
      if (percent !== undefined) {
        state.tax.percent = percent;
        state.tax.value = ((state.subtotal - state.discount.value) * percent) / 100;
      }
      get().calculateTotals();
      return {};
    });
  },

  setPaymentMethod: (method: string) => {
    set({ paymentMethod: method });
  },

  setNotes: (notes: string) => {
    set({ notes });
  },

  calculateTotals: () => {
    set((state) => {
      const subtotal = state.items.reduce((sum, item) => {
        return sum + (item.subtotal - (item.discount_value || 0));
      }, 0);

      const totalDiscount = state.items.reduce((sum, item) => {
        return sum + (item.discount_value || 0);
      }, 0) + state.discount.value;

      const baseTax = subtotal - totalDiscount;
      const taxValue = baseTax * (state.tax.percent / 100) + state.tax.value;
      const total = baseTax + taxValue;

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    });
  },

  clear: () => {
    set({
      items: [],
      subtotal: 0,
      discount: { value: 0, percent: 0 },
      tax: { value: 0, percent: 0 },
      total: 0,
      paymentMethod: 'cash',
      notes: ''
    });
  },

  getTotal: () => {
    return get().total;
  },

  getChange: (paid: number) => {
    return Math.round((paid - get().total) * 100) / 100;
  }
}));
