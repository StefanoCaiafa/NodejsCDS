import { AuthService } from './AuthService';
import { IUserRepository } from '../../../core/interfaces/IUserRepository';
import { ITokenBlacklistRepository } from '../../../core/interfaces/ITokenBlacklistRepository';
import { User } from '../models/User';
import { CryptoUtil } from '../../../utils/crypto';
import jwt from 'jsonwebtoken';

jest.mock('../../../utils/crypto');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockTokenBlacklistRepository: jest.Mocked<ITokenBlacklistRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      emailExists: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockTokenBlacklistRepository = {
      addToBlacklist: jest.fn(),
      isBlacklisted: jest.fn(),
      cleanupExpired: jest.fn(),
    } as jest.Mocked<ITokenBlacklistRepository>;

    authService = new AuthService(mockUserRepository, mockTokenBlacklistRepository);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      const createdUser: User = {
        id: 1,
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      (CryptoUtil.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await authService.register(registerDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(CryptoUtil.hashPassword).toHaveBeenCalledWith(registerDto.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      };

      const existingUser: User = {
        id: 1,
        email: registerDto.email,
        firstName: 'Existing',
        lastName: 'User',
        password: 'hashed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(registerDto)).rejects.toThrow('Email already registered');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user: User = {
        id: 1,
        email: loginDto.email,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed_password',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const token = 'jwt_token_here';

      mockUserRepository.findByEmail.mockResolvedValue(user);
      (CryptoUtil.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      const result = await authService.login(loginDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(CryptoUtil.comparePassword).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', token);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error with invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
      expect(CryptoUtil.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error with invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user: User = {
        id: 1,
        email: loginDto.email,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed_password',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(user);
      (CryptoUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should add token to blacklist successfully', async () => {
      const token = 'valid_jwt_token';
      const userId = 1;
      const mockDecoded = {
        userId,
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwt.decode as jest.Mock).mockReturnValue(mockDecoded);
      mockTokenBlacklistRepository.addToBlacklist.mockResolvedValue();

      await authService.logout(token, userId);

      expect(jwt.decode).toHaveBeenCalledWith(token);
      expect(mockTokenBlacklistRepository.addToBlacklist).toHaveBeenCalledWith(
        token,
        userId,
        expect.any(Date),
      );
    });

    it('should throw error with invalid token', async () => {
      const token = 'invalid_token';
      const userId = 1;

      (jwt.decode as jest.Mock).mockReturnValue(null);

      await expect(authService.logout(token, userId)).rejects.toThrow('Invalid token');
      expect(mockTokenBlacklistRepository.addToBlacklist).not.toHaveBeenCalled();
    });
  });
});
