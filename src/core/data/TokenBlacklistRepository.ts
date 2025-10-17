import { Repository, MoreThan } from 'typeorm';
import { ITokenBlacklistRepository } from '../interfaces/ITokenBlacklistRepository';
import { BlacklistedToken } from '../../modules/auth/models/BlacklistedToken';
import { AppDataSource } from '../../db/data-source';

export class TokenBlacklistRepository implements ITokenBlacklistRepository {
  private repository: Repository<BlacklistedToken>;

  constructor() {
    this.repository = AppDataSource.getRepository(BlacklistedToken);
  }

  async addToBlacklist(token: string, userId: number, expiresAt: Date): Promise<void> {
    const blacklistedToken = this.repository.create({
      token,
      userId,
      expiresAt: expiresAt.toISOString(),
    });
    await this.repository.save(blacklistedToken);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        token,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresAt: MoreThan(new Date().toISOString()) as any,
      },
    });
    return count > 0;
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(BlacklistedToken)
      .where('expiresAt <= datetime("now")')
      .execute();
    return result.affected ?? 0;
  }
}
