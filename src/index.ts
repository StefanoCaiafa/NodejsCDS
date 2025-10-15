import 'reflect-metadata';
import { Server } from './server';
import { logger } from './utils/logger';
import { runPendingMigrations } from './db/migrationRunner';

async function bootstrap(): Promise<void> {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await runPendingMigrations();
    }

    const server = new Server();

    await server.initialize();

    await server.start();

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT signal');
      await server.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM signal');
      await server.shutdown();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
