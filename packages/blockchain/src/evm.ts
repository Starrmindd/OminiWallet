import { ethers } from 'ethers';
import { TokenBalance, Transaction, ChainId } from '@omniwallet/utils';
import { CHAINS } from './chains';

// Minimal ERC-20 ABI for balance + transfer
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export function getEVMProvider(chainId: ChainId): ethers.JsonRpcProvider {
  const chain = CHAINS[chainId];
  if (!chain || !chain.isEVM) throw new Error(`${chainId} is not an EVM chain`);
  return new ethers.JsonRpcProvider(chain.rpcUrl);
}

export function getWalletFromPrivateKey(
  privateKey: string,
  chainId: ChainId
): ethers.Wallet {
  const provider = getEVMProvider(chainId);
  return new ethers.Wallet(privateKey, provider);
}

export async function getEVMNativeBalance(
  address: string,
  chainId: ChainId
): Promise<TokenBalance> {
  const provider = getEVMProvider(chainId);
  const chain = CHAINS[chainId];
  const raw = await provider.getBalance(address);
  const formatted = ethers.formatEther(raw);
  return {
    address: 'native',
    symbol: chain.symbol,
    name: chain.name,
    decimals: 18,
    balance: raw.toString(),
    balanceFormatted: formatted,
    balanceUSD: 0, // enriched by price service
    chainId,
  };
}

export async function getERC20Balance(
  walletAddress: string,
  tokenAddress: string,
  chainId: ChainId
): Promise<TokenBalance> {
  const provider = getEVMProvider(chainId);
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const [raw, decimals, symbol, name] = await Promise.all([
    contract.balanceOf(walletAddress),
    contract.decimals(),
    contract.symbol(),
    contract.name(),
  ]);
  const formatted = ethers.formatUnits(raw, decimals);
  return {
    address: tokenAddress,
    symbol,
    name,
    decimals: Number(decimals),
    balance: raw.toString(),
    balanceFormatted: formatted,
    balanceUSD: 0,
    chainId,
  };
}

export async function estimateEVMGas(
  from: string,
  to: string,
  value: string,
  chainId: ChainId
): Promise<{ gasLimit: string; gasPrice: string; totalFeeETH: string }> {
  const provider = getEVMProvider(chainId);
  const [gasLimit, feeData] = await Promise.all([
    provider.estimateGas({ from, to, value: ethers.parseEther(value) }),
    provider.getFeeData(),
  ]);
  const gasPrice = feeData.gasPrice ?? 0n;
  const totalFee = gasLimit * gasPrice;
  return {
    gasLimit: gasLimit.toString(),
    gasPrice: gasPrice.toString(),
    totalFeeETH: ethers.formatEther(totalFee),
  };
}

export async function sendEVMTransaction(
  privateKey: string,
  to: string,
  valueEth: string,
  chainId: ChainId
): Promise<string> {
  const wallet = getWalletFromPrivateKey(privateKey, chainId);
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(valueEth),
  });
  return tx.hash;
}

export async function getEVMTransactionHistory(
  address: string,
  chainId: ChainId,
  limit = 20
): Promise<Transaction[]> {
  // Use Etherscan-compatible API (works for ETH, Polygon, BSC)
  const explorerApis: Partial<Record<ChainId, string>> = {
    ethereum: 'https://api.etherscan.io/api',
    polygon: 'https://api.polygonscan.com/api',
    bsc: 'https://api.bscscan.com/api',
  };
  const apiUrl = explorerApis[chainId];
  if (!apiUrl) return [];

  const url = `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== '1') return [];

  return data.result.map((tx: any): Transaction => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    valueFormatted: ethers.formatEther(tx.value),
    gasUsed: tx.gasUsed,
    gasPrice: tx.gasPrice,
    status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
    timestamp: Number(tx.timeStamp),
    chainId,
    type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
  }));
}

export async function simulateEVMTransaction(
  from: string,
  to: string,
  value: string,
  chainId: ChainId
): Promise<{ success: boolean; error?: string }> {
  try {
    const provider = getEVMProvider(chainId);
    await provider.call({ from, to, value: ethers.parseEther(value) });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
