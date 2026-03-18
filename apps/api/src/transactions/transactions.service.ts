import { Injectable, BadRequestException } from '@nestjs/common';
import { WalletsService } from '../wallets/wallets.service';
import {
  getEVMTransactionHistory,
  getSolanaTransactionHistory,
  getBitcoinTransactionHistory,
  estimateEVMGas,
  simulateEVMTransaction,
} from '@omniwallet/blockchain';
import { ChainId, Transaction } from '@omniwallet/utils';

@Injectable()
export class TransactionsService {
  constructor(private walletsService: WalletsService) {}

  async getHistory(userId: string, walletId: string): Promise<Transaction[]> {
    const wallet = await this.walletsService.getWallet(userId, walletId);
    const chainId = wallet.chainId as ChainId;

    if (chainId === 'solana') return getSolanaTransactionHistory(wallet.address);
    if (chainId === 'bitcoin') return getBitcoinTransactionHistory(wallet.address);
    return getEVMTransactionHistory(wallet.address, chainId);
  }

  async estimateGas(
    userId: string,
    walletId: string,
    to: string,
    value: string,
  ) {
    const wallet = await this.walletsService.getWallet(userId, walletId);
    const chainId = wallet.chainId as ChainId;

    if (!['ethereum', 'polygon', 'bsc', 'arbitrum'].includes(chainId)) {
      throw new BadRequestException('Gas estimation only supported for EVM chains');
    }

    return estimateEVMGas(wallet.address, to, value, chainId);
  }

  async simulateTransaction(
    userId: string,
    walletId: string,
    to: string,
    value: string,
  ) {
    const wallet = await this.walletsService.getWallet(userId, walletId);
    const chainId = wallet.chainId as ChainId;

    if (!['ethereum', 'polygon', 'bsc', 'arbitrum'].includes(chainId)) {
      return { success: true }; // non-EVM: skip simulation
    }

    return simulateEVMTransaction(wallet.address, to, value, chainId);
  }
}
