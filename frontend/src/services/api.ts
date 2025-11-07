import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { ApiResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          Cookies.remove('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.client.post<ApiResponse<{ user: any; token: string }>>('/auth/register', {
      email,
      password,
      name
    });
  }

  async login(email: string, password: string) {
    return this.client.post<ApiResponse<{ user: any; token: string }>>('/auth/login', {
      email,
      password
    });
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  async getProfile() {
    return this.client.get('/auth/profile');
  }

  // Products
  async getProducts(page = 1, limit = 50, category?: string, search?: string) {
    return this.client.get('/products', {
      params: { page, limit, category, search }
    });
  }

  async getProduct(id: string) {
    return this.client.get(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.client.post('/products', data);
  }

  async updateProduct(id: string, data: any) {
    return this.client.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`);
  }

  async getCategories() {
    return this.client.get('/products/categories');
  }

  // Transactions
  async getTransactions(page = 1, limit = 50, startDate?: string, endDate?: string) {
    return this.client.get('/transactions', {
      params: { page, limit, startDate, endDate }
    });
  }

  async getTransaction(id: string) {
    return this.client.get(`/transactions/${id}`);
  }

  async createTransaction(data: any) {
    return this.client.post('/transactions', data);
  }

  async getTransactionSummary(startDate?: string, endDate?: string) {
    return this.client.get('/transactions/summary', {
      params: { startDate, endDate }
    });
  }

  // Stock
  async getAllStock(page = 1, limit = 50, lowStockOnly = false) {
    return this.client.get('/stock', {
      params: { page, limit, lowStockOnly }
    });
  }

  async getStockByProduct(productId: string) {
    return this.client.get(`/stock/product/${productId}`);
  }

  async stockIn(product_id: string, quantity: number, notes?: string) {
    return this.client.post('/stock/in', { product_id, quantity, notes });
  }

  async stockOut(product_id: string, quantity: number, notes?: string) {
    return this.client.post('/stock/out', { product_id, quantity, notes });
  }

  async getStockHistory(product_id?: string, type?: string, page = 1, limit = 50) {
    return this.client.get('/stock/history', {
      params: { product_id, type, page, limit }
    });
  }

  // Reports
  async getSalesReport(startDate?: string, endDate?: string) {
    return this.client.get('/reports/sales', {
      params: { startDate, endDate }
    });
  }

  async getProfitReport(startDate?: string, endDate?: string) {
    return this.client.get('/reports/profit', {
      params: { startDate, endDate }
    });
  }

  async getTopProducts(startDate?: string, endDate?: string, limit = 10) {
    return this.client.get('/reports/top-products', {
      params: { startDate, endDate, limit }
    });
  }

  async getCashierReport(startDate?: string, endDate?: string) {
    return this.client.get('/reports/cashier', {
      params: { startDate, endDate }
    });
  }

  async getCategoryReport(startDate?: string, endDate?: string) {
    return this.client.get('/reports/category', {
      params: { startDate, endDate }
    });
  }

  // Sync
  async getUnsyncedData() {
    return this.client.post('/sync/get-unsynced');
  }

  async syncData(products: string[], transactions: string[], stock_history: string[]) {
    return this.client.post('/sync/sync', {
      products,
      transactions,
      stock_history
    });
  }

  async getSyncStatus() {
    return this.client.get('/sync/status');
  }

  async addToSyncQueue(entity_type: string, entity_id: string, action: string, data: any) {
    return this.client.post('/sync/queue', {
      entity_type,
      entity_id,
      action,
      data
    });
  }

  async getSyncQueue() {
    return this.client.get('/sync/queue');
  }

  async markQueueProcessed(queue_ids: string[]) {
    return this.client.post('/sync/queue/mark-processed', { queue_ids });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const api = new ApiClient();
