'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { href: '/wallets', icon: '◈', label: 'Wallets' },
  { href: '/transactions', icon: '↕', label: 'Transactions' },
  { href: '/settings', icon: '⚙', label: 'Settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, email } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    router.push('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-surface-card border-r border-surface-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-lg">
            ◈
          </div>
          <span className="font-bold text-lg">OmniWallet</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  active
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-elevated mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold">
            {email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{email || 'User'}</p>
            <p className="text-xs text-gray-500">Non-custodial</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full text-left text-sm">
          Sign out
        </button>
      </div>
    </aside>
  );
}
