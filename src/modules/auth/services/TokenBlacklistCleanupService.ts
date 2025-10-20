import * as cron from 'node-cron';
import { ITokenBlacklistRepository } from '../../../core/interfaces/ITokenBlacklistRepository';

export class TokenBlacklistCleanupService {
  private cronJob: cron.ScheduledTask | null = null;

  constructor(private tokenBlacklistRepository: ITokenBlacklistRepository) {}

  start(cronExpression: string = '0 * * * *'): void {
    if (this.cronJob) {
      return;
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      await this.tokenBlacklistRepository.cleanupExpired();
    });
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
  }

  async runCleanup(): Promise<number> {
    const deletedCount = await this.tokenBlacklistRepository.cleanupExpired();
    return deletedCount;
  }
}
