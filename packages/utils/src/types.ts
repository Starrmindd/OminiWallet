export type ChainId =
  | 'ethereum'
  | 'polygon'
  | 'bsc'
  | 'arbitrum'
  | 'optimism'
  | 'solana'
  | 'bitcoin';

export type WalletType = 'imported' | 'walletconnect' | 'injected';

export interface Chain {
  id: ChainId;
  name: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
  logoUrl: string;
  chainIdHex?: string; // EVM only
  isEVM: boolean;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;       // raw balance string
  balanceFormatted: string;
  balanceUSD: number;
  logoUrl?: string;
  chainId: ChainId;
}

export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  imageUrl?: string;
  chainId: ChainId;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  valueUSD?: number;
  gasUsed?: string;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  chainId: ChainId;
  type: 'send' | 'receive' | 'contract' | 'swap';
}

export interface WalletAccount {
  id: string;
  address: string;
  chainId: ChainId;
  label?: string;
  type: WalletType;
  balances: TokenBalance[];
  totalUSD: number;
}

export interface Portfolio {
  totalUSD: number;
  wallets: WalletAccount[];
  change24h: number;
  change24hPercent: number;
}
