import { AppDataSource } from './data-source';

export const runPendingMigrations = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.runMigrations({
    transaction: 'all',
  });

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};
