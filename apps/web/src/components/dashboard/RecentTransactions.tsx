'use client';

import { useQuery } from '@tanstack/react-query';
import { txApi } from '@/lib/api';
import { WalletAccount, Transaction, formatTimestamp, shortenAddress, formatUSD } from '@/lib/omni';

interface Props {
  wallets: WalletAccount[];
}

export function RecentTransactions({ wallets }: Props) {
  const firstWallet = wallets[0];

  const { data: txs, isLoading } = useQuery({
    queryKey: ['transactions', firstWallet?.id],
    queryFn: async () => {
      if (!firstWallet) return [];
      const res = await txApi.history(firstWallet.id);
      return res.data as Transaction[];
    },
    enabled: !!firstWallet,
  });

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-elevated rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      {!txs?.length ? (
        <p className="text-gray-500 text-sm text-center py-8">No transactions found</p>
      ) : (
        <div className="space-y-2">
          {txs.slice(0, 8).map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${tx.type === 'receive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {tx.type === 'receive' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{tx.type}</p>
                  <p className="text-xs text-gray-500 font-mono">{shortenAddress(tx.hash, 6)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${tx.type === 'receive' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'receive' ? '+' : '-'}{parseFloat(tx.valueFormatted).toFixed(4)}
                </p>
                <p className="text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</p>
              </div>
              <span className={`ml-4 badge ${tx.status === 'confirmed' ? 'badge-green' : tx.status === 'pending' ? 'badge-yellow' : 'badge-red'}`}>
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
