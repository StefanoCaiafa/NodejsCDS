import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { database } from './db/database';
import { logger } from './utils/logger';
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
    try {
      await database.initialize();

      this.setupMiddleware();

      this.setupRoutes();

      this.setupErrorHandling();

      this.setupTokenCleanup();

      logger.info('Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize server:', error);
      throw error;
    }
  }

  private setupMiddleware(): void {
    this.app.use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
      }),
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use((req, _res, next) => {
      logger.info(`${req.method} ${req.url}`);
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

    logger.info('Token blacklist cleanup service initialized');
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`API Documentation: http://localhost:${this.port}/api-docs`);
        logger.info(`Swagger JSON: http://localhost:${this.port}/api-docs.json`);
        resolve();
      });
    });
  }

  getApp(): Application {
    return this.app;
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down server...');

    if (this.cleanupService) {
      this.cleanupService.stop();
    }

    await database.close();
    logger.info('Server shut down successfully');
  }
}
