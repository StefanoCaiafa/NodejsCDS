import { AppDataSource } from './data-source';
import { logger } from '../utils/logger';
import { Migration } from 'typeorm';

export const runPendingMigrations = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const executedMigrations: Migration[] = await AppDataSource.runMigrations({
      transaction: 'all',
    });

    if (executedMigrations.length > 0) {
      executedMigrations.forEach((migration: Migration) => {
        logger.info(`Migration executed: ${migration.name}`);
      });
    } else {
      logger.info('No pending migrations to execute');
    }
  } catch (error) {
    logger.error('Failed to run pending migrations', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};
