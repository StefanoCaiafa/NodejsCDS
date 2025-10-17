import 'reflect-metadata';
import { Server } from './server';
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
      await server.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await server.shutdown();
      process.exit(0);
    });

    process.on('uncaughtException', (_error) => {
      process.exit(1);
    });

    process.on('unhandledRejection', (_reason, _promise) => {
      process.exit(1);
    });
  } catch (error) {
    process.exit(1);
  }
}

bootstrap();
