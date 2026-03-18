import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { TokenBalance, Transaction as OmniTx } from '@omniwallet/utils';

export function getSolanaConnection(rpcUrl?: string): Connection {
  return new Connection(
    rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );
}

export async function getSolanaBalance(address: string): Promise<TokenBalance> {
  const connection = getSolanaConnection();
  const pubkey = new PublicKey(address);
  const lamports = await connection.getBalance(pubkey);
  const sol = lamports / LAMPORTS_PER_SOL;
  return {
    address: 'native',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    balance: lamports.toString(),
    balanceFormatted: sol.toString(),
    balanceUSD: 0,
    chainId: 'solana',
  };
}

export async function sendSolanaTransaction(
  secretKey: Uint8Array,
  toAddress: string,
  amountSOL: number
): Promise<string> {
  const connection = getSolanaConnection();
  const from = Keypair.fromSecretKey(secretKey);
  const to = new PublicKey(toAddress);
  const lamports = Math.floor(amountSOL * LAMPORTS_PER_SOL);

  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: from.publicKey, toPubkey: to, lamports })
  );
  const sig = await sendAndConfirmTransaction(connection, tx, [from]);
  return sig;
}

export async function getSolanaTransactionHistory(
  address: string,
  limit = 20
): Promise<OmniTx[]> {
  const connection = getSolanaConnection();
  const pubkey = new PublicKey(address);
  const sigs = await connection.getSignaturesForAddress(pubkey, { limit });

  return sigs.map((s) => ({
    hash: s.signature,
    from: address,
    to: '',
    value: '0',
    valueFormatted: '0',
    status: s.err ? 'failed' : 'confirmed',
    timestamp: s.blockTime || 0,
    chainId: 'solana' as const,
    type: 'send' as const,
  }));
}
