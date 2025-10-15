import { IDataAccess } from '../interfaces/IDataAccess';
import { database } from '../../db/database';
import { logger } from '../../utils/logger';

export abstract class DataAccess<T> implements IDataAccess<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected buildWhereClause(criteria: Partial<T>): {
    clause: string;
    values: (string | number | boolean | null)[];
  } {
    const keys = Object.keys(criteria);
    if (keys.length === 0) {
      return { clause: '', values: [] };
    }

    const conditions = keys.map((key) => `${key} = ?`);
    const values = keys.map((key) => criteria[key as keyof T] as string | number | boolean | null);

    return {
      clause: `WHERE ${conditions.join(' AND ')}`,
      values,
    };
  }

  async create(entity: Partial<T>): Promise<T> {
    try {
      const keys = Object.keys(entity);
      const values = Object.values(entity) as (string | number | boolean | null)[];
      const placeholders = keys.map(() => '?').join(', ');

      const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const result = await database.run(sql, values);

      const created = await this.findById(result.lastID!);
      if (!created) {
        throw new Error('Failed to retrieve created record');
      }

      logger.info(`Created record in ${this.tableName} with ID: ${result.lastID}`);
      return created;
    } catch (error) {
      logger.error(`Error creating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async findById(id: number): Promise<T | undefined> {
    try {
      const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
      const result = await database.get<T>(sql, [id]);
      return result;
    } catch (error) {
      logger.error(`Error finding record by ID in ${this.tableName}:`, error);
      throw error;
    }
  }

  async findAll(criteria?: Partial<T>): Promise<T[]> {
    try {
      let sql = `SELECT * FROM ${this.tableName}`;
      let params: (string | number | boolean | null)[] = [];

      if (criteria) {
        const where = this.buildWhereClause(criteria);
        sql += ` ${where.clause}`;
        params = where.values;
      }

      const results = await database.all<T>(sql, params);
      return results;
    } catch (error) {
      logger.error(`Error finding records in ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: number, entity: Partial<T>): Promise<T | undefined> {
    try {
      const keys = Object.keys(entity);
      const values = Object.values(entity) as (string | number | boolean | null)[];
      const setClause = keys.map((key) => `${key} = ?`).join(', ');

      const sql = `UPDATE ${this.tableName} SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
      await database.run(sql, [...values, id]);

      return await this.findById(id);
    } catch (error) {
      logger.error(`Error updating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
      const result = await database.run(sql, [id]);
      return (result.changes ?? 0) > 0;
    } catch (error) {
      logger.error(`Error deleting record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async findOne(criteria: Partial<T>): Promise<T | undefined> {
    try {
      const where = this.buildWhereClause(criteria);
      const sql = `SELECT * FROM ${this.tableName} ${where.clause} LIMIT 1`;
      const result = await database.get<T>(sql, where.values);
      return result;
    } catch (error) {
      logger.error(`Error finding one record in ${this.tableName}:`, error);
      throw error;
    }
  }
}
