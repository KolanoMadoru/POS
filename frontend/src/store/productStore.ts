import { create } from 'zustand';
import { Product, PaginationData } from '../types';
import { api } from '../services/api';
import { db } from '../db/database';

interface ProductStore {
  products: Product[];
  pagination: PaginationData;
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;

  fetchProducts: (page?: number, category?: string, search?: string) => Promise<void>;
  getProduct: (id: string) => Promise<Product | null>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  syncProducts: () => Promise<void>;
  getLocalProducts: () => Promise<Product[]>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  pagination: { page: 1, limit: 50, total: 0 },
  isLoading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',

  fetchProducts: async (page = 1, category?: string, search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getProducts(page, 50, category, search);
      const { data: responseData } = response;

      if (responseData.data) {
        const { products, pagination } = responseData.data;
        set({ products, pagination });

        // Cache to IndexedDB
        for (const product of products) {
          await db.products.put(product);
        }
      }
    } catch (error: any) {
      const message = error.message || 'Failed to fetch products';
      set({ error: message });

      // Fallback to cached products
      const cachedProducts = await db.products.toArray();
      if (cachedProducts.length > 0) {
        set({ products: cachedProducts });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  getProduct: async (id: string) => {
    try {
      const response = await api.getProduct(id);
      if (response.data.data) {
        return response.data.data.product;
      }
    } catch (error) {
      // Try from cache
      return await db.products.get(id) || null;
    }
    return null;
  },

  createProduct: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.createProduct(data);
      if (response.data.data) {
        const { product } = response.data.data;
        await db.products.put(product);
        set((state) => ({
          products: [product, ...state.products]
        }));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create product';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProduct: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.updateProduct(id, data);
      if (response.data.data) {
        const { product } = response.data.data;
        await db.products.put(product);
        set((state) => ({
          products: state.products.map(p => p.id === id ? product : p)
        }));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update product';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteProduct(id);
      await db.products.delete(id);
      set((state) => ({
        products: state.products.filter(p => p.id !== id)
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete product';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedCategory: (category: string | null) => {
    set({ selectedCategory: category });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  syncProducts: async () => {
    const unsynced = await get().getLocalProducts();
    if (unsynced.length > 0) {
      const unsyncedIds = unsynced.map(p => p.id);
      try {
        await api.syncData(unsyncedIds, [], []);
      } catch (error) {
        console.error('Failed to sync products:', error);
      }
    }
  },

  getLocalProducts: async () => {
    return db.products.toArray();
  }
}));
