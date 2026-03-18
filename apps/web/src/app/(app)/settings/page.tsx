'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsPage() {
  const { email } = useAuthStore();
  const [totpCode, setTotpCode] = useState('');
  const [showTotpSetup, setShowTotpSetup] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await authApi.getProfile()).data,
  });

  const setupTotpMutation = useMutation({
    mutationFn: () => authApi.setupTotp(),
    onSuccess: () => setShowTotpSetup(true),
    onError: () => toast.error('Failed to setup 2FA'),
  });

  const enableTotpMutation = useMutation({
    mutationFn: () => authApi.enableTotp(totpCode),
    onSuccess: () => {
      toast.success('2FA enabled');
      setShowTotpSetup(false);
    },
    onError: () => toast.error('Invalid code'),
  });

  return (
    <div className="p-8 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Account and security</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-surface-border">
            <span className="text-gray-400">Email</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-surface-border">
            <span className="text-gray-400">Account type</span>
            <span className="badge badge-blue">Non-custodial</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-400">Member since</span>
            <span className="text-sm">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Security</h2>
        <div className="space-y-4">
          {/* 2FA */}
          <div className="flex justify-between items-center py-3 border-b border-surface-border">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-400">TOTP via authenticator app</p>
            </div>
            {profile?.totpEnabled ? (
              <span className="badge badge-green">Enabled</span>
            ) : (
              <button
                className="btn-secondary text-sm"
                onClick={() => setupTotpMutation.mutate()}
                disabled={setupTotpMutation.isPending}
              >
                Enable 2FA
              </button>
            )}
          </div>

          {showTotpSetup && setupTotpMutation.data && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-elevated rounded-xl p-4 space-y-4"
            >
              <p className="text-sm text-gray-400">
                Scan this secret with your authenticator app (Google Authenticator, Authy, etc.):
              </p>
              <code className="block bg-surface p-3 rounded-lg text-brand-400 text-sm font-mono break-all">
                {setupTotpMutation.data.data.secret}
              </code>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Enter verification code</label>
                <input
                  className="input font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                />
              </div>
              <button
                className="btn-primary w-full"
                onClick={() => enableTotpMutation.mutate()}
                disabled={totpCode.length !== 6 || enableTotpMutation.isPending}
              >
                Verify & Enable
              </button>
            </motion.div>
          )}

          {/* E2EE info */}
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium">End-to-End Encryption</p>
              <p className="text-sm text-gray-400">AES-256 + device key derivation</p>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>OmniWallet v1.0.0 — Non-custodial multi-chain wallet hub</p>
          <p>Private keys never leave your device. All sensitive data is encrypted client-side using AES-256 before any server interaction.</p>
          <p className="text-brand-400">Supported chains: Ethereum, Polygon, BNB Chain, Arbitrum, Solana, Bitcoin</p>
        </div>
      </div>
    </div>
  );
}
