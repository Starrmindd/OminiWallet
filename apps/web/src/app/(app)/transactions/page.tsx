'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { walletsApi, txApi } from '@/lib/api';
import { Transaction, formatTimestamp, shortenAddress } from '@/lib/omni';

export default function TransactionsPage() {
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [sendForm, setSendForm] = useState({ to: '', value: '' });
  const [showSend, setShowSend] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<any>(null);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => (await walletsApi.list()).data,
  });

  const activeWalletId = selectedWalletId || wallets[0]?.id;

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['transactions', activeWalletId],
    queryFn: async () => {
      if (!activeWalletId) return [];
      return (await txApi.history(activeWalletId)).data as Transaction[];
    },
    enabled: !!activeWalletId,
  });

  const estimateMutation = useMutation({
    mutationFn: () => txApi.estimate(activeWalletId, sendForm.to, sendForm.value),
    onSuccess: (res) => setGasEstimate(res.data),
    onError: () => toast.error('Gas estimation failed'),
  });

  const simulateMutation = useMutation({
    mutationFn: () => txApi.simulate(activeWalletId, sendForm.to, sendForm.value),
    onSuccess: (res) => {
      if (res.data.success) toast.success('Transaction simulation passed');
      else toast.error(`Simulation failed: ${res.data.error}`);
    },
  });

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-400 text-sm mt-1">History and send</p>
        </div>
        <button className="btn-primary" onClick={() => setShowSend(!showSend)}>
          {showSend ? 'Cancel' : '↑ Send'}
        </button>
      </div>

      {/* Wallet selector */}
      {wallets.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {wallets.map((w: any) => (
            <button
              key={w.id}
              onClick={() => setSelectedWalletId(w.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                (activeWalletId === w.id)
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-elevated text-gray-400 hover:text-white'
              }`}
            >
              {w.label || w.chainId} · {shortenAddress(w.address)}
            </button>
          ))}
        </div>
      )}

      {/* Send Panel */}
      {showSend && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-brand-600/30"
        >
          <h2 className="text-lg font-semibold mb-4">Send Transaction</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Recipient Address</label>
              <input
                className="input font-mono text-sm"
                placeholder="0x..."
                value={sendForm.to}
                onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Amount (ETH)</label>
              <input
                className="input"
                type="number"
                step="0.0001"
                placeholder="0.01"
                value={sendForm.value}
                onChange={(e) => setSendForm({ ...sendForm, value: e.target.value })}
              />
            </div>

            {gasEstimate && (
              <div className="bg-surface-elevated rounded-xl p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Limit</span>
                  <span className="font-mono">{gasEstimate.gasLimit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Fee</span>
                  <span className="font-mono text-yellow-400">{parseFloat(gasEstimate.totalFeeETH).toFixed(6)} ETH</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => estimateMutation.mutate()}
                disabled={!sendForm.to || !sendForm.value}
              >
                Estimate Gas
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => simulateMutation.mutate()}
                disabled={!sendForm.to || !sendForm.value}
              >
                Simulate
              </button>
              <button
                className="btn-primary flex-1"
                disabled={!gasEstimate}
                onClick={() => toast.error('Decrypt private key on client to sign — see walletEncryption.ts')}
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">History</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-surface-elevated rounded-xl animate-pulse" />
            ))}
          </div>
        ) : txs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions found</p>
        ) : (
          <div className="space-y-2">
            {txs.map((tx) => (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                    ${tx.type === 'receive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type === 'receive' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-500 font-mono">{shortenAddress(tx.hash, 8)}</p>
                    <p className="text-xs text-gray-600">{formatTimestamp(tx.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${tx.type === 'receive' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type === 'receive' ? '+' : '-'}{parseFloat(tx.valueFormatted).toFixed(6)}
                  </p>
                  <span className={`badge text-xs ${
                    tx.status === 'confirmed' ? 'badge-green' :
                    tx.status === 'pending' ? 'badge-yellow' : 'badge-red'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
