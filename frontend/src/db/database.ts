import Dexie, { Table } from 'dexie';
import { User, Product, Transaction, TransactionItem, StockHistory } from '../types';

export class POSDB extends Dexie {
  users!: Table<User>;
  products!: Table<Product>;
  transactions!: Table<Transaction>;
  transactionItems!: Table<TransactionItem>;
  stockHistory!: Table<StockHistory>;
  syncQueue!: Table<{
    id: string;
    entity_type: string;
    entity_id: string;
    action: string;
    data: string;
    created_at: string;
    processed: boolean;
  }>;

  constructor() {
    super('POSDB');
    this.version(1).stores({
      users: 'id, email',
      products: 'id, sku, category, &sku',
      transactions: 'id, cashier_id, created_at',
      transactionItems: 'id, transaction_id, product_id',
      stockHistory: 'id, product_id, created_at',
      syncQueue: '++id, entity_type, processed'
    });
  }

  async clearAllData(): Promise<void> {
    await this.users.clear();
    await this.products.clear();
    await this.transactions.clear();
    await this.transactionItems.clear();
    await this.stockHistory.clear();
    await this.syncQueue.clear();
  }

  async getUnsyncedTransactions(): Promise<Transaction[]> {
    return this.transactions
      .where('synced')
      .equals(false)
      .toArray();
  }

  async getUnsyncedProducts(): Promise<Product[]> {
    return this.products
      .where('synced')
      .equals(false)
      .toArray();
  }

  async getUnsyncedStockHistory(): Promise<StockHistory[]> {
    return this.stockHistory
      .where('synced')
      .equals(false)
      .toArray();
  }
}

export const db = new POSDB();
