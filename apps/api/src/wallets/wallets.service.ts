import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { AddWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { isValidAddress } from '@omniwallet/utils';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) {}

  async addWallet(userId: string, dto: AddWalletDto): Promise<Wallet> {
    if (!isValidAddress(dto.address, dto.chainId as any)) {
      throw new ForbiddenException(`Invalid address for chain ${dto.chainId}`);
    }

    // Prevent duplicate wallet per user
    const existing = await this.walletRepo.findOne({
      where: { userId, address: dto.address.toLowerCase(), chainId: dto.chainId },
    });
    if (existing) return existing;

    const wallet = this.walletRepo.create({
      userId,
      address: dto.address.toLowerCase(),
      chainId: dto.chainId,
      label: dto.label,
      type: dto.type || 'imported',
      encryptedKey: dto.encryptedKey, // already encrypted by client
    });
    return this.walletRepo.save(wallet);
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return this.walletRepo.find({
      where: { userId, isActive: true },
      select: ['id', 'address', 'chainId', 'label', 'type', 'createdAt'],
      // NOTE: encryptedKey intentionally excluded from list response
    });
  }

  async getWallet(userId: string, walletId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ where: { id: walletId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.userId !== userId) throw new ForbiddenException();
    return wallet;
  }

  async updateWallet(userId: string, walletId: string, dto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.getWallet(userId, walletId);
    Object.assign(wallet, dto);
    return this.walletRepo.save(wallet);
  }

  async removeWallet(userId: string, walletId: string): Promise<void> {
    const wallet = await this.getWallet(userId, walletId);
    await this.walletRepo.update(wallet.id, { isActive: false });
  }

  async getEncryptedKey(userId: string, walletId: string): Promise<string | null> {
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
      select: ['id', 'userId', 'encryptedKey'],
    });
    if (!wallet) throw new NotFoundException();
    if (wallet.userId !== userId) throw new ForbiddenException();
    return wallet.encryptedKey || null;
  }
}
