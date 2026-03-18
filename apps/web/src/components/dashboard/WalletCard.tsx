'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { WalletAccount, formatUSD, shortenAddress } from '@/lib/omni';

const CHAIN_COLORS: Record<string, string> = {
  ethereum: 'from-blue-600/20 to-blue-900/10 border-blue-600/30',
  polygon: 'from-purple-600/20 to-purple-900/10 border-purple-600/30',
  bsc: 'from-yellow-600/20 to-yellow-900/10 border-yellow-600/30',
  arbitrum: 'from-sky-600/20 to-sky-900/10 border-sky-600/30',
  solana: 'from-green-600/20 to-green-900/10 border-green-600/30',
  bitcoin: 'from-orange-600/20 to-orange-900/10 border-orange-600/30',
};

const CHAIN_ICONS: Record<string, string> = {
  ethereum: '⟠',
  polygon: '⬡',
  bsc: '◆',
  arbitrum: '◈',
  solana: '◎',
  bitcoin: '₿',
};

interface Props {
  wallet: WalletAccount;
  index: number;
}

export function WalletCard({ wallet, index }: Props) {
  const gradient = CHAIN_COLORS[wallet.chainId] || 'from-gray-600/20 to-gray-900/10 border-gray-600/30';
  const icon = CHAIN_ICONS[wallet.chainId] || '◈';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`card bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-transform cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-medium capitalize">{wallet.label || wallet.chainId}</p>
            <p className="text-xs text-gray-500 font-mono">{shortenAddress(wallet.address)}</p>
          </div>
        </div>
        <span className="badge badge-blue capitalize">{wallet.type}</span>
      </div>

      <div className="space-y-2">
        {wallet.balances.map((bal) => (
          <div key={bal.address} className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">{bal.symbol}</span>
            <div className="text-right">
              <p className="font-medium text-sm">{parseFloat(bal.balanceFormatted).toFixed(4)}</p>
              <p className="text-xs text-gray-500">{formatUSD(bal.balanceUSD)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-gray-400 text-sm">Total</span>
        <span className="font-bold">{formatUSD(wallet.totalUSD)}</span>
      </div>
    </motion.div>
  );
}
