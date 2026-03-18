import axios from 'axios';
import { TokenBalance, Transaction as OmniTx } from '@omniwallet/utils';

const BLOCKSTREAM_API = 'https://blockstream.info/api';

export async function getBitcoinBalance(address: string): Promise<TokenBalance> {
  const res = await axios.get(`${BLOCKSTREAM_API}/address/${address}`);
  const { chain_stats, mempool_stats } = res.data;
  const confirmedSats: number = chain_stats.funded_txo_sum - chain_stats.spent_txo_sum;
  const pendingSats: number = mempool_stats.funded_txo_sum - mempool_stats.spent_txo_sum;
  const totalSats = confirmedSats + pendingSats;
  const btc = totalSats / 1e8;

  return {
    address: 'native',
    symbol: 'BTC',
    name: 'Bitcoin',
    decimals: 8,
    balance: totalSats.toString(),
    balanceFormatted: btc.toFixed(8),
    balanceUSD: 0,
    chainId: 'bitcoin',
  };
}

export async function getBitcoinTransactionHistory(
  address: string,
  limit = 20
): Promise<OmniTx[]> {
  const res = await axios.get(`${BLOCKSTREAM_API}/address/${address}/txs`);
  const txs = res.data.slice(0, limit);

  return txs.map((tx: any): OmniTx => {
    const received = tx.vout
      .filter((o: any) => o.scriptpubkey_address === address)
      .reduce((sum: number, o: any) => sum + o.value, 0);
    const sent = tx.vin
      .filter((i: any) => i.prevout?.scriptpubkey_address === address)
      .reduce((sum: number, i: any) => sum + i.prevout.value, 0);
    const net = received - sent;

    return {
      hash: tx.txid,
      from: address,
      to: address,
      value: Math.abs(net).toString(),
      valueFormatted: (Math.abs(net) / 1e8).toFixed(8),
      status: tx.status.confirmed ? 'confirmed' : 'pending',
      timestamp: tx.status.block_time || Date.now() / 1000,
      chainId: 'bitcoin',
      type: net >= 0 ? 'receive' : 'send',
    };
  });
}
