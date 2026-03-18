import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString } from 'class-validator';

class EstimateGasDto {
  @IsString() to: string;
  @IsString() value: string;
}

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private txService: TransactionsService) {}

  @Get('wallet/:walletId')
  getHistory(@Request() req: any, @Param('walletId') walletId: string) {
    return this.txService.getHistory(req.user.userId, walletId);
  }

  @Post('wallet/:walletId/estimate')
  estimateGas(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Body() dto: EstimateGasDto,
  ) {
    return this.txService.estimateGas(req.user.userId, walletId, dto.to, dto.value);
  }

  @Post('wallet/:walletId/simulate')
  simulate(
    @Request() req: any,
    @Param('walletId') walletId: string,
    @Body() dto: EstimateGasDto,
  ) {
    return this.txService.simulateTransaction(req.user.userId, walletId, dto.to, dto.value);
  }
}
