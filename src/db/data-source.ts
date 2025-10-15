import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { User } from '../modules/auth/models/User';
import { Favorite } from '../modules/favorites/models/Favorite';
import { BlacklistedToken } from '../modules/auth/models/BlacklistedToken';

const resolveDatabasePath = (): string => {
  const rawPath = env.DB_PATH;
  if (path.isAbsolute(rawPath)) {
    return rawPath;
  }
  return path.resolve(process.cwd(), rawPath);
};

const ensureDatabaseDirectory = (databasePath: string): void => {
  const directory = path.dirname(databasePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const databasePath = resolveDatabasePath();
ensureDatabaseDirectory(databasePath);

const migrationsExtension = __filename.endsWith('.ts') ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: databasePath,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [User, Favorite, BlacklistedToken],
  migrations: [path.join(__dirname, 'migrations', `*.${migrationsExtension}`)],
});
