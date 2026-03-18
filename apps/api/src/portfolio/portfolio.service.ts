import { Injectable } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import {
  getEVMNativeBalance,
  getSolanaBalance,
  getBitcoinBalance,
  getTokenPrices,
} from '@omniwallet/blockchain';
import { Portfolio, WalletAccount, ChainId } from '@omniwallet/utils';

@Injectable()
export class PortfolioService {
  constructor(private walletsService: WalletsService) {}

  async getPortfolio(userId: string): Promise<Portfolio> {
    const wallets = await this.walletsService.getUserWallets(userId);

    // Fetch all balances in parallel
    const walletAccounts: WalletAccount[] = await Promise.all(
      wallets.map(async (w) => {
        try {
          const balance = await this.fetchBalance(w.address, w.chainId as ChainId);
          return {
            id: w.id,
            address: w.address,
            chainId: w.chainId as ChainId,
            label: w.label,
            type: w.type as any,
            balances: [balance],
            totalUSD: balance.balanceUSD,
          };
        } catch {
          return {
            id: w.id,
            address: w.address,
            chainId: w.chainId as ChainId,
            label: w.label,
            type: w.type as any,
            balances: [],
            totalUSD: 0,
          };
        }
      })
    );

    // Enrich with USD prices
    const chainIds = [...new Set(wallets.map((w) => w.chainId as ChainId))];
    const prices = await getTokenPrices(chainIds).catch(() => ({}));

    const geckoIdMap: Record<string, string> = {
      ethereum: 'ethereum', polygon: 'matic-network', bsc: 'binancecoin',
      arbitrum: 'ethereum', solana: 'solana', bitcoin: 'bitcoin',
    };

    for (const account of walletAccounts) {
      const geckoId = geckoIdMap[account.chainId];
      const price = (prices as any)[geckoId]?.usd ?? 0;
      for (const bal of account.balances) {
        bal.balanceUSD = parseFloat(bal.balanceFormatted) * price;
      }
      account.totalUSD = account.balances.reduce((s, b) => s + b.balanceUSD, 0);
    }

    const totalUSD = walletAccounts.reduce((s, w) => s + w.totalUSD, 0);

    return {
      totalUSD,
      wallets: walletAccounts,
      change24h: 0,
      change24hPercent: 0,
    };
  }

  private async fetchBalance(address: string, chainId: ChainId) {
    if (chainId === 'solana') return getSolanaBalance(address);
    if (chainId === 'bitcoin') return getBitcoinBalance(address);
    return getEVMNativeBalance(address, chainId);
  }
}
