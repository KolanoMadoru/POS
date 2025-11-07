export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'kasir' | 'owner';
  phone?: string;
  address?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  price_buy: number;
  price_sell: number;
  unit: string;
  stock: number;
  min_stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  synced?: boolean;
}

export interface CartItem {
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  discount_value?: number;
  discount_percent?: number;
  subtotal: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  cashier_id: string;
  cashier_name?: string;
  subtotal: number;
  discount_value: number;
  discount_percent: number;
  tax_value: number;
  tax_percent: number;
  total: number;
  amount_paid: number;
  change_amount: number;
  payment_method: string;
  notes?: string;
  items?: TransactionItem[];
  created_at: string;
  synced?: boolean;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  price: number;
  discount_value: number;
  discount_percent: number;
  subtotal: number;
  notes?: string;
  created_at?: string;
}

export interface StockHistory {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  notes?: string;
  user_id?: string;
  created_at: string;
  synced?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
}

export interface SyncStatus {
  unsynced_products: number;
  unsynced_transactions: number;
  unsynced_stock_history: number;
  pending_queue: number;
  is_online: boolean;
}

export interface Report {
  date?: string;
  transaction_count: number;
  total_sales: number;
  total_discount: number;
  total_tax?: number;
  avg_transaction?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface CreateTransactionRequest {
  items: CartItem[];
  subtotal: number;
  discount_value: number;
  discount_percent: number;
  tax_value: number;
  tax_percent: number;
  amount_paid: number;
  payment_method: string;
  notes?: string;
}
