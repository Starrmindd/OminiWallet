import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { AddWalletDto, UpdateWalletDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get()
  getWallets(@Request() req: any) {
    return this.walletsService.getUserWallets(req.user.userId);
  }

  @Post()
  addWallet(@Request() req: any, @Body() dto: AddWalletDto) {
    return this.walletsService.addWallet(req.user.userId, dto);
  }

  @Put(':id')
  updateWallet(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateWalletDto) {
    return this.walletsService.updateWallet(req.user.userId, id, dto);
  }

  @Delete(':id')
  removeWallet(@Request() req: any, @Param('id') id: string) {
    return this.walletsService.removeWallet(req.user.userId, id);
  }

  // Returns encrypted key blob — client decrypts with their password
  @Get(':id/key')
  getEncryptedKey(@Request() req: any, @Param('id') id: string) {
    return this.walletsService.getEncryptedKey(req.user.userId, id);
  }
}
