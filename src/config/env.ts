import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DB_PATH: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  TMDB_API_KEY: string;
  TMDB_API_URL: string;
  CORS_ORIGIN: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar('PORT', '8000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  DB_PATH: getEnvVar('DB_PATH', './src/db/database.sqlite'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'default-secret-key'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '24h'),
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  TMDB_API_URL: getEnvVar('TMDB_API_URL', 'https://api.themoviedb.org/3'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', '*'),
};
