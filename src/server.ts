import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { AppDataSource } from './db/data-source';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { TokenBlacklistRepository } from './core/data/TokenBlacklistRepository';
import { TokenBlacklistCleanupService } from './modules/auth/services/TokenBlacklistCleanupService';

import authRoutes from './modules/auth/routes/authRoutes';
import movieRoutes from './modules/movies/routes/movieRoutes';
import favoriteRoutes from './modules/favorites/routes/favoriteRoutes';

export class Server {
  private app: Application;
  private port: number;
  private cleanupService: TokenBlacklistCleanupService | null = null;

  constructor() {
    this.app = express();
    this.port = env.PORT;
  }

  async initialize(): Promise<void> {
    // Initialize TypeORM DataSource
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    this.setupMiddleware();

    this.setupRoutes();

    this.setupErrorHandling();

    this.setupTokenCleanup();
  }

  private setupMiddleware(): void {
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
      }),
    );

    this.app.use(express.json());

    this.app.use(
      (
        err: Error,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ): void => {
        if (err instanceof SyntaxError && 'body' in err) {
          res.status(400).json({
            success: false,
            error: 'Invalid JSON format in request body',
            timestamp: new Date().toISOString(),
          });
          return;
        }
        next(err);
      },
    );

    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((_req, _res, next) => {
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    this.app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    this.app.get('/swagger.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'CodigoDelSur API Docs',
      }),
    );

    this.app.use('/api', authRoutes);
    this.app.use('/api', movieRoutes);
    this.app.use('/api', favoriteRoutes);

    this.app.get('/', (_req, res) => {
      res.json({
        message: 'CodigoDelSur Backend API',
        version: '1.0.0',
        documentation: '/api-docs',
        swagger_json: '/api-docs.json',
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(notFoundHandler);

    this.app.use(errorHandler);
  }

  private setupTokenCleanup(): void {
    const tokenBlacklistRepository = new TokenBlacklistRepository();
    this.cleanupService = new TokenBlacklistCleanupService(tokenBlacklistRepository);

    this.cleanupService.start('0 * * * *');
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        resolve();
      });
    });
  }

  getApp(): Application {
    return this.app;
  }

  async shutdown(): Promise<void> {
    if (this.cleanupService) {
      this.cleanupService.stop();
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}
