import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WalletAccount, Portfolio } from '@/lib/omni';

interface WalletState {
  portfolio: Portfolio | null;
  activeWalletId: string | null;
  isLoading: boolean;
  lastUpdated: number | null;
  setPortfolio: (portfolio: Portfolio) => void;
  setActiveWallet: (id: string) => void;
  setLoading: (loading: boolean) => void;
  getActiveWallet: () => WalletAccount | null;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      portfolio: null,
      activeWalletId: null,
      isLoading: false,
      lastUpdated: null,

      setPortfolio: (portfolio) =>
        set({ portfolio, lastUpdated: Date.now() }),

      setActiveWallet: (id) => set({ activeWalletId: id }),

      setLoading: (isLoading) => set({ isLoading }),

      getActiveWallet: () => {
        const { portfolio, activeWalletId } = get();
        if (!portfolio || !activeWalletId) return null;
        return portfolio.wallets.find((w) => w.id === activeWalletId) || null;
      },
    }),
    {
      name: 'omniwallet-wallets',
      partialize: (state) => ({ activeWalletId: state.activeWalletId }),
    }
  )
);
