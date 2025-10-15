import { ITokenBlacklistRepository } from '../interfaces/ITokenBlacklistRepository';
import { BlacklistedToken } from '../../modules/auth/models/BlacklistedToken';
import { database } from '../../db/database';
import { logger } from '../../utils/logger';

export class TokenBlacklistRepository implements ITokenBlacklistRepository {
  private tableName = 'token_blacklist';

  async addToBlacklist(token: string, userId: number, expiresAt: Date): Promise<void> {
    try {
      const sql = `INSERT INTO ${this.tableName} (token, userId, expiresAt) VALUES (?, ?, ?)`;
      await database.run(sql, [token, userId, expiresAt.toISOString()]);
      logger.info(`Token added to blacklist for user ${userId}`);
    } catch (error) {
      logger.error('Error adding token to blacklist:', error);
      throw error;
    }
  }

  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const sql = `SELECT id FROM ${this.tableName} WHERE token = ? AND expiresAt > datetime('now')`;
      const result = await database.get<BlacklistedToken>(sql, [token]);
      return !!result;
    } catch (error) {
      logger.error('Error checking token blacklist:', error);
      throw error;
    }
  }

  async cleanupExpired(): Promise<number> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE expiresAt <= datetime('now')`;
      const result = await database.run(sql);
      const deletedCount = result.changes ?? 0;
      logger.info(`Cleaned up ${deletedCount} expired tokens from blacklist`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }
}
