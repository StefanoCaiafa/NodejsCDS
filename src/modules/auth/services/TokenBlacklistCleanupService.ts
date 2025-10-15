import * as cron from 'node-cron';
import { ITokenBlacklistRepository } from '../../../core/interfaces/ITokenBlacklistRepository';
import { logger } from '../../../utils/logger';

export class TokenBlacklistCleanupService {
  private cronJob: cron.ScheduledTask | null = null;

  constructor(private tokenBlacklistRepository: ITokenBlacklistRepository) {}

  start(cronExpression: string = '0 * * * *'): void {
    if (this.cronJob) {
      logger.warn('Token cleanup cron job is already running');
      return;
    }

    this.cronJob = cron.schedule(cronExpression, async () => {
      try {
        logger.info('Running token blacklist cleanup...');
        const deletedCount = await this.tokenBlacklistRepository.cleanupExpired();
        logger.info(
          `Token cleanup completed. Removed ${deletedCount} expired tokens from blacklist`,
        );
      } catch (error) {
        logger.error('Error during token cleanup:', error);
      }
    });

    logger.info(`Token blacklist cleanup cron job started (schedule: ${cronExpression})`);
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info('Token blacklist cleanup cron job stopped');
    }
  }

  async runCleanup(): Promise<number> {
    logger.info('Running manual token cleanup...');
    const deletedCount = await this.tokenBlacklistRepository.cleanupExpired();
    logger.info(`Manual cleanup completed. Removed ${deletedCount} expired tokens`);
    return deletedCount;
  }
}
