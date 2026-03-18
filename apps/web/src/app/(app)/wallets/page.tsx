'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { walletsApi } from '@/lib/api';
import { encryptPrivateKey, getEthereumAddress } from '@/lib/walletEncryption';
import { shortenAddress, isValidAddress } from '@/lib/omni';

const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
  { id: 'polygon', name: 'Polygon', icon: '⬡' },
  { id: 'bsc', name: 'BNB Chain', icon: '◆' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '◈' },
  { id: 'solana', name: 'Solana', icon: '◎' },
  { id: 'bitcoin', name: 'Bitcoin', icon: '₿' },
];

export default function WalletsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    chainId: 'ethereum',
    address: '',
    privateKey: '',
    label: '',
    password: '',
    importType: 'address' as 'address' | 'privateKey',
  });

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const res = await walletsApi.list();
      return res.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      let address = form.address;
      let encryptedKey: string | undefined;

      if (form.importType === 'privateKey') {
        if (!form.password) throw new Error('Password required to encrypt private key');
        // Derive address from private key (EVM only)
        address = await getEthereumAddress(form.privateKey);
        // Encrypt before sending to server
        encryptedKey = encryptPrivateKey(form.privateKey, form.password);
      }

      if (!isValidAddress(address, form.chainId as any)) {
        throw new Error(`Invalid address for ${form.chainId}`);
      }

      return walletsApi.add({
        address,
        chainId: form.chainId,
        label: form.label || undefined,
        type: 'imported',
        encryptedKey,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      setShowAdd(false);
      setForm({ chainId: 'ethereum', address: '', privateKey: '', label: '', password: '', importType: 'address' });
      toast.success('Wallet added');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add wallet'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => walletsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Wallet removed');
    },
  });

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your connected wallets</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          + Add Wallet
        </button>
      </div>

      {/* Wallet List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-surface-elevated" />
          ))}
        </div>
      ) : wallets.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">◈</p>
          <p className="text-gray-400">No wallets yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet: any) => {
            const chain = CHAINS.find((c) => c.id === wallet.chainId);
            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="card flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{chain?.icon || '◈'}</span>
                  <div>
                    <p className="font-medium">{wallet.label || chain?.name || wallet.chainId}</p>
                    <p className="text-sm text-gray-500 font-mono">{shortenAddress(wallet.address, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge badge-blue capitalize">{wallet.type}</span>
                  <button
                    onClick={() => removeMutation.mutate(wallet.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Wallet Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md"
            >
              <h2 className="text-xl font-semibold mb-6">Add Wallet</h2>

              <div className="space-y-4">
                {/* Import type */}
                <div className="flex gap-2">
                  {(['address', 'privateKey'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, importType: t })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        form.importType === t
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-elevated text-gray-400 hover:text-white'
                      }`}
                    >
                      {t === 'address' ? 'Watch Address' : 'Private Key'}
                    </button>
                  ))}
                </div>

                {/* Chain */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Chain</label>
                  <select
                    className="input"
                    value={form.chainId}
                    onChange={(e) => setForm({ ...form, chainId: e.target.value })}
                  >
                    {CHAINS.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {form.importType === 'address' ? (
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Wallet Address</label>
                    <input
                      className="input font-mono text-sm"
                      placeholder="0x... or bc1... or sol..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Private Key</label>
                      <input
                        type="password"
                        className="input font-mono text-sm"
                        placeholder="0x..."
                        value={form.privateKey}
                        onChange={(e) => setForm({ ...form, privateKey: e.target.value })}
                      />
                      <p className="text-xs text-yellow-400 mt-1">
                        ⚠ Encrypted locally before storage. Never sent in plaintext.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Encryption Password</label>
                      <input
                        type="password"
                        className="input"
                        placeholder="Used to encrypt your key"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Label (optional)</label>
                  <input
                    className="input"
                    placeholder="My main wallet"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="btn-secondary flex-1" onClick={() => setShowAdd(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn-primary flex-1"
                    onClick={() => addMutation.mutate()}
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? 'Adding...' : 'Add Wallet'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
