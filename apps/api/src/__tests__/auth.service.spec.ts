/**
 * Auth service unit tests.
 * Uses mocked TypeORM repository and JwtService.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';

const mockUser: Partial<User> = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  passwordHash: '',
  totpEnabled: false,
  isActive: true,
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;

  beforeEach(async () => {
    // Pre-hash a password for tests
    mockUser.passwordHash = await bcrypt.hash('Password123', 12);

    userRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.register({ email: 'new@example.com', password: 'Password123' });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('throws ConflictException if email exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@example.com', password: 'Password123' })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.login({ email: 'test@example.com', password: 'Password123' });
      expect(result).toHaveProperty('accessToken');
    });

    it('throws UnauthorizedException on wrong password', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nobody@example.com', password: 'Password123' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
