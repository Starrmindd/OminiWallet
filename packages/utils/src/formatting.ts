/**
 * Format a raw token balance using its decimals
 */
export function formatTokenBalance(raw: string, decimals: number, precision = 6): string {
  const value = Number(raw) / Math.pow(10, decimals);
  if (value === 0) return '0';
  if (value < 0.000001) return '< 0.000001';
  return value.toFixed(precision).replace(/\.?0+$/, '');
}

/**
 * Format USD value with commas and 2 decimal places
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Shorten an address for display: 0x1234...abcd
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format a unix timestamp to a human-readable date
 */
export function formatTimestamp(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts * 1000));
}

/**
 * Format percentage change with sign
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
