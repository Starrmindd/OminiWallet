import { IsString, IsOptional, IsIn } from 'class-validator';

export class AddWalletDto {
  @IsString()
  address: string;

  @IsString()
  @IsIn(['ethereum', 'polygon', 'bsc', 'arbitrum', 'solana', 'bitcoin'])
  chainId: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  @IsIn(['imported', 'walletconnect', 'injected'])
  type?: string;

  /**
   * AES-256 encrypted private key (encrypted on client before sending).
   * Optional — not required for watch-only or WalletConnect wallets.
   */
  @IsOptional()
  @IsString()
  encryptedKey?: string;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  label?: string;
}
