import { create } from 'zustand';
import { SyncStatus } from '../types';
import { api } from '../services/api';
import { db } from '../db/database';

interface SyncStore {
  status: SyncStatus;
  isSyncing: boolean;
  lastSyncTime: string | null;
  error: string | null;

  getSyncStatus: () => Promise<void>;
  sync: () => Promise<void>;
  clearError: () => void;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  status: {
    unsynced_products: 0,
    unsynced_transactions: 0,
    unsynced_stock_history: 0,
    pending_queue: 0,
    is_online: navigator.onLine
  },
  isSyncing: false,
  lastSyncTime: null,
  error: null,

  getSyncStatus: async () => {
    try {
      if (!api.isOnline()) {
        set({
          status: {
            unsynced_products: 0,
            unsynced_transactions: 0,
            unsynced_stock_history: 0,
            pending_queue: 0,
            is_online: false
          }
        });
        return;
      }

      const response = await api.getSyncStatus();
      if (response.data.data) {
        set({
          status: {
            ...response.data.data,
            is_online: true
          }
        });
      }
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  },

  sync: async () => {
    if (!api.isOnline()) {
      set({ error: 'No internet connection' });
      return;
    }

    set({ isSyncing: true, error: null });
    try {
      const unsyncedProducts = await db.getUnsyncedProducts();
      const unsyncedTransactions = await db.getUnsyncedTransactions();
      const unsyncedStockHistory = await db.getUnsyncedStockHistory();

      if (unsyncedProducts.length > 0 || unsyncedTransactions.length > 0 || unsyncedStockHistory.length > 0) {
        await api.syncData(
          unsyncedProducts.map(p => p.id),
          unsyncedTransactions.map(t => t.id),
          unsyncedStockHistory.map(s => s.id)
        );

        // Mark as synced in local DB
        for (const product of unsyncedProducts) {
          await db.products.update(product.id, { synced: true });
        }
        for (const transaction of unsyncedTransactions) {
          await db.transactions.update(transaction.id, { synced: true });
        }
        for (const stockHistory of unsyncedStockHistory) {
          await db.stockHistory.update(stockHistory.id, { synced: true });
        }
      }

      set({ lastSyncTime: new Date().toISOString() });
      await get().getSyncStatus();
    } catch (error: any) {
      const message = error.message || 'Sync failed';
      set({ error: message });
    } finally {
      set({ isSyncing: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));
