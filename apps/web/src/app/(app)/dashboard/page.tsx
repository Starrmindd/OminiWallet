'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { portfolioApi } from '@/lib/api';
import { useWalletStore } from '@/store/wallet.store';
import { formatUSD, formatPercent, shortenAddress } from '@/lib/omni';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import Link from 'next/link';

export default function DashboardPage() {
  const { setPortfolio } = useWalletStore();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const res = await portfolioApi.get();
      setPortfolio(res.data);
      return res.data;
    },
    refetchInterval: 30_000, // refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-32 animate-pulse bg-surface-elevated" />
          ))}
        </div>
      </div>
    );
  }

  const totalUSD = portfolio?.totalUSD ?? 0;
  const wallets = portfolio?.wallets ?? [];

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time across all chains</p>
        </div>
        <Link href="/wallets" className="btn-primary text-sm">
          + Add Wallet
        </Link>
      </div>

      {/* Total Balance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-br from-brand-900/50 to-surface-card border-brand-600/30"
      >
        <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
        <p className="text-5xl font-bold text-white">{formatUSD(totalUSD)}</p>
        <div className="flex items-center gap-4 mt-4">
          <span className={`badge ${portfolio?.change24hPercent >= 0 ? 'badge-green' : 'badge-red'}`}>
            {formatPercent(portfolio?.change24hPercent ?? 0)} (24h)
          </span>
          <span className="text-gray-500 text-sm">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''} connected</span>
        </div>
      </motion.div>

      {/* Chart placeholder */}
      <PortfolioChart wallets={wallets} />

      {/* Wallet Cards */}
      {wallets.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Connected Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {wallets.map((wallet, i) => (
              <WalletCard key={wallet.id} wallet={wallet} index={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">◈</p>
          <p className="text-gray-400 mb-4">No wallets connected yet</p>
          <Link href="/wallets" className="btn-primary inline-block">
            Connect your first wallet
          </Link>
        </div>
      )}

      {/* Recent Transactions */}
      {wallets.length > 0 && <RecentTransactions wallets={wallets} />}
    </div>
  );
}
