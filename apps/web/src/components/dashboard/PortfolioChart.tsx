'use client';

import { WalletAccount, formatUSD } from '@/lib/omni';

interface Props {
  wallets: WalletAccount[];
}

const CHAIN_COLORS: Record<string, string> = {
  ethereum: '#3b82f6',
  polygon: '#8b5cf6',
  bsc: '#f59e0b',
  arbitrum: '#06b6d4',
  solana: '#10b981',
  bitcoin: '#f97316',
};

export function PortfolioChart({ wallets }: Props) {
  if (!wallets.length) return null;

  const total = wallets.reduce((s, w) => s + w.totalUSD, 0);
  if (total === 0) return null;

  // Build pie segments
  let cumulative = 0;
  const segments = wallets
    .filter((w) => w.totalUSD > 0)
    .map((w) => {
      const pct = (w.totalUSD / total) * 100;
      const start = cumulative;
      cumulative += pct;
      return { wallet: w, pct, start };
    });

  const radius = 60;
  const cx = 80;
  const cy = 80;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(start: number, end: number) {
    const s = polarToCartesian(start * 3.6);
    const e = polarToCartesian(end * 3.6);
    const large = end - start > 50 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y} Z`;
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Allocation</h2>
      <div className="flex items-center gap-8">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((seg) => (
            <path
              key={seg.wallet.id}
              d={arcPath(seg.start, seg.start + seg.pct)}
              fill={CHAIN_COLORS[seg.wallet.chainId] || '#6366f1'}
              opacity={0.85}
              stroke="#0f0f1a"
              strokeWidth="2"
            />
          ))}
          <circle cx={cx} cy={cy} r={35} fill="#1a1a2e" />
          <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
            Total
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="8">
            {wallets.length} chains
          </text>
        </svg>

        <div className="flex-1 space-y-2">
          {segments.map((seg) => (
            <div key={seg.wallet.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: CHAIN_COLORS[seg.wallet.chainId] || '#6366f1' }}
                />
                <span className="text-sm capitalize text-gray-300">
                  {seg.wallet.label || seg.wallet.chainId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{formatUSD(seg.wallet.totalUSD)}</span>
                <span className="text-xs text-gray-500 ml-2">{seg.pct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
