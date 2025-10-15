export interface ITokenBlacklistRepository {
  addToBlacklist(token: string, userId: number, expiresAt: Date): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
  cleanupExpired(): Promise<number>;
}
