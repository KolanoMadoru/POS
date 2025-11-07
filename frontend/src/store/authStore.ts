import { create } from 'zustand';
import Cookies from 'js-cookie';
import { User } from '../types';
import { api } from '../services/api';
import { db } from '../db/database';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOnline: boolean;
  error: string | null;
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setOnline: (online: boolean) => void;
  getStoredUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isOnline: navigator.onLine,
  error: null,

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(email, password, name);
      const { data: responseData } = response;
      
      if (responseData.data) {
        const { user, token } = responseData.data;
        Cookies.set('auth_token', token);
        set({ user, token });
        await db.users.put(user);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);
      const { data: responseData } = response;
      
      if (responseData.data) {
        const { user, token } = responseData.data;
        Cookies.set('auth_token', token);
        set({ user, token });
        await db.users.put(user);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message });
      
      // Try offline login
      if (!api.isOnline()) {
        const storedUser = await db.users.where('email').equals(email).first();
        if (storedUser) {
          set({ user: storedUser, token: 'offline' });
          return;
        }
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('auth_token');
      set({ user: null, token: null });
    }
  },

  setOnline: (online: boolean) => {
    set({ isOnline: online });
  },

  getStoredUser: async () => {
    const token = Cookies.get('auth_token');
    if (token) {
      const users = await db.users.toArray();
      if (users.length > 0) {
        set({ user: users[0], token });
      }
    }
  }
}));
