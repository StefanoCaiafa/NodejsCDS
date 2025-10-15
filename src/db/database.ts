import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export class Database {
  private static instance: Database;
  private db: sqlite3.Database | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const dbPath = path.resolve(env.DB_PATH);
      const dbDir = path.dirname(dbPath);

      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error('Error connecting to database:', err);
          throw err;
        }
        logger.info('Connected to SQLite database');
      });

      await this.run('PRAGMA foreign_keys = ON');

      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  public getDb(): sqlite3.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  public async run(
    sql: string,
    params: (string | number | boolean | null)[] = [],
  ): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  public async get<T>(
    sql: string,
    params: (string | number | boolean | null)[] = [],
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  public async all<T>(
    sql: string,
    params: (string | number | boolean | null)[] = [],
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const db = this.getDb();
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            logger.info('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

export const database = Database.getInstance();
