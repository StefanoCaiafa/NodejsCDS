import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../core/interfaces/IUserRepository';
import { ITokenBlacklistRepository } from '../../../core/interfaces/ITokenBlacklistRepository';
import { RegisterUserDto } from '../dtos/RegisterUserDto';
import { LoginRequestDto } from '../dtos/LoginRequestDto';
import { User, UserSafe } from '../models/User';
import { CryptoUtil } from '../../../utils/crypto';
import { env } from '../../../config/env';
import { AppError } from '../../../middleware/errorHandler';

export class AuthService {
  constructor(
    private userRepository: IUserRepository,
    private tokenBlacklistRepository: ITokenBlacklistRepository,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserSafe> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await CryptoUtil.hashPassword(dto.password);

    const user = await this.userRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: hashedPassword,
    });

    return this.sanitizeUser(user);
  }

  async login(dto: LoginRequestDto): Promise<{ user: UserSafe; token: string }> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await CryptoUtil.comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async logout(token: string, userId: number): Promise<void> {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (!decoded || !decoded.exp) {
      throw new AppError('Invalid token', 400);
    }

    const expiresAt = new Date(decoded.exp * 1000);

    await this.tokenBlacklistRepository.addToBlacklist(token, userId, expiresAt);
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  private sanitizeUser(user: User): UserSafe {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
