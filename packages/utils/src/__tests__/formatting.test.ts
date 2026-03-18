import { formatTokenBalance, formatUSD, shortenAddress, formatPercent } from '../formatting';

describe('formatting', () => {
  it('formats token balance with decimals', () => {
    expect(formatTokenBalance('1000000000000000000', 18)).toBe('1');
    expect(formatTokenBalance('500000000000000000', 18)).toBe('0.5');
    expect(formatTokenBalance('0', 18)).toBe('0');
  });

  it('formats USD values', () => {
    expect(formatUSD(1234.56)).toBe('$1,234.56');
    expect(formatUSD(0)).toBe('$0.00');
    expect(formatUSD(1000000)).toBe('$1,000,000.00');
  });

  it('shortens addresses', () => {
    const addr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    expect(shortenAddress(addr)).toBe('0xd8dA...6045');
    expect(shortenAddress(addr, 6)).toBe('0xd8dA6B...96045');
  });

  it('formats percentages with sign', () => {
    expect(formatPercent(5.5)).toBe('+5.50%');
    expect(formatPercent(-3.2)).toBe('-3.20%');
    expect(formatPercent(0)).toBe('+0.00%');
  });
});
