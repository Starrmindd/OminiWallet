import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'OmniWallet — Universal Crypto Wallet Hub',
  description: 'One login. All wallets. Any device. Full control.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #2a2a4a',
                borderRadius: '12px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
