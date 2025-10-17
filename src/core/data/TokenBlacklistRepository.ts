import { ITokenBlacklistRepository } from '../interfaces/ITokenBlacklistRepository';
import { BlacklistedToken } from '../../modules/auth/models/BlacklistedToken';
import { database } from '../../db/database';

export class TokenBlacklistRepository implements ITokenBlacklistRepository {
  private tableName = 'token_blacklist';

  async addToBlacklist(token: string, userId: number, expiresAt: Date): Promise<void> {
    const sql = `INSERT INTO ${this.tableName} (token, userId, expiresAt) VALUES (?, ?, ?)`;
    await database.run(sql, [token, userId, expiresAt.toISOString()]);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const sql = `SELECT id FROM ${this.tableName} WHERE token = ? AND expiresAt > datetime('now')`;
    const result = await database.get<BlacklistedToken>(sql, [token]);
    return !!result;
  }

  async cleanupExpired(): Promise<number> {
    const sql = `DELETE FROM ${this.tableName} WHERE expiresAt <= datetime('now')`;
    const result = await database.run(sql);
    const deletedCount = result.changes ?? 0;
    return deletedCount;
  }
}
