import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken } = useAuthStore.getState();
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh, userId } = res.data;
        useAuthStore.getState().setTokens(accessToken, newRefresh, userId);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string, totpCode?: string) =>
    api.post('/auth/login', { email, password, totpCode }),
  getProfile: () => api.get('/auth/profile'),
  setupTotp: () => api.post('/auth/totp/setup'),
  enableTotp: (code: string) => api.post('/auth/totp/enable', { code }),
};

// Wallets
export const walletsApi = {
  list: () => api.get('/wallets'),
  add: (data: any) => api.post('/wallets', data),
  update: (id: string, data: any) => api.put(`/wallets/${id}`, data),
  remove: (id: string) => api.delete(`/wallets/${id}`),
  getKey: (id: string) => api.get(`/wallets/${id}/key`),
};

// Portfolio
export const portfolioApi = {
  get: () => api.get('/portfolio'),
};

// Transactions
export const txApi = {
  history: (walletId: string) => api.get(`/transactions/wallet/${walletId}`),
  estimate: (walletId: string, to: string, value: string) =>
    api.post(`/transactions/wallet/${walletId}/estimate`, { to, value }),
  simulate: (walletId: string, to: string, value: string) =>
    api.post(`/transactions/wallet/${walletId}/simulate`, { to, value }),
};
