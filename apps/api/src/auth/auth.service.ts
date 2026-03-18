import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({ email: dto.email, passwordHash });
    await this.userRepo.save(user);

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // TOTP check
    if (user.totpEnabled) {
      if (!dto.totpCode) throw new UnauthorizedException('TOTP code required');
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret!,
        encoding: 'base32',
        token: dto.totpCode,
        window: 1,
      });
      if (!verified) throw new UnauthorizedException('Invalid TOTP code');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    return this.generateTokens(user);
  }

  async setupTotp(userId: string) {
    const secret = speakeasy.generateSecret({ name: 'OmniWallet', length: 20 });
    await this.userRepo.update(userId, { totpSecret: secret.base32 });
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url };
  }

  async enableTotp(userId: string, code: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.totpSecret) throw new BadRequestException('TOTP not set up');

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!verified) throw new BadRequestException('Invalid TOTP code');

    await this.userRepo.update(userId, { totpEnabled: true });
    return { message: '2FA enabled successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'totpEnabled', 'createdAt'],
    });
    return user;
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.update(user.id, { refreshToken: hashedRefresh });

    return { accessToken, refreshToken, userId: user.id };
  }
}
