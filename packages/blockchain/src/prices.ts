import axios from 'axios';
import { ChainId } from '@omniwallet/utils';

const COINGECKO_IDS: Record<ChainId, string> = {
  ethereum: 'ethereum',
  polygon: 'matic-network',
  bsc: 'binancecoin',
  arbitrum: 'ethereum',
  optimism: 'ethereum',
  solana: 'solana',
  bitcoin: 'bitcoin',
};

export interface PriceData {
  usd: number;
  usd_24h_change: number;
}

export async function getTokenPrices(
  chainIds: ChainId[]
): Promise<Record<string, PriceData>> {
  const ids = [...new Set(chainIds.map((c) => COINGECKO_IDS[c]))].join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const headers: Record<string, string> = {};
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }

  const res = await axios.get(url, { headers });
  return res.data;
}

export async function getNativeTokenPrice(chainId: ChainId): Promise<number> {
  const prices = await getTokenPrices([chainId]);
  const geckoId = COINGECKO_IDS[chainId];
  return prices[geckoId]?.usd ?? 0;
}

export async function getERC20Prices(
  contractAddresses: string[],
  platform = 'ethereum'
): Promise<Record<string, PriceData>> {
  if (!contractAddresses.length) return {};
  const addresses = contractAddresses.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses}&vs_currencies=usd&include_24hr_change=true`;
  const res = await axios.get(url);
  return res.data;
}
