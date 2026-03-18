import {
  Controller, Post, Get, Body, UseGuards, Request, HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto, @Request() req: any) {
    // userId comes from a non-verified decode for refresh flow
    const payload = JSON.parse(
      Buffer.from(dto.refreshToken.split('.')[1], 'base64').toString()
    );
    return this.authService.refreshTokens(payload.sub, dto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('totp/setup')
  @UseGuards(JwtAuthGuard)
  setupTotp(@Request() req: any) {
    return this.authService.setupTotp(req.user.userId);
  }

  @Post('totp/enable')
  @UseGuards(JwtAuthGuard)
  enableTotp(@Request() req: any, @Body('code') code: string) {
    return this.authService.enableTotp(req.user.userId, code);
  }
}
