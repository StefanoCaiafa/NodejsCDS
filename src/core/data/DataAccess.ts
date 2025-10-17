import { IDataAccess } from '../interfaces/IDataAccess';
import { database } from '../../db/database';

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
    const keys = Object.keys(entity);
    const values = Object.values(entity) as (string | number | boolean | null)[];
    const placeholders = keys.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await database.run(sql, values);

    const created = await this.findById(result.lastID!);
    if (!created) {
      throw new Error('Failed to retrieve created record');
    }

    return created;
  }

  async findById(id: number): Promise<T | undefined> {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const result = await database.get<T>(sql, [id]);
    return result;
  }

  async findAll(criteria?: Partial<T>): Promise<T[]> {
    let sql = `SELECT * FROM ${this.tableName}`;
    let params: (string | number | boolean | null)[] = [];

    if (criteria) {
      const where = this.buildWhereClause(criteria);
      sql += ` ${where.clause}`;
      params = where.values;
    }

    const results = await database.all<T>(sql, params);
    return results;
  }

  async update(id: number, entity: Partial<T>): Promise<T | undefined> {
    const keys = Object.keys(entity);
    const values = Object.values(entity) as (string | number | boolean | null)[];
    const setClause = keys.map((key) => `${key} = ?`).join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    await database.run(sql, [...values, id]);

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await database.run(sql, [id]);
    return (result.changes ?? 0) > 0;
  }

  async findOne(criteria: Partial<T>): Promise<T | undefined> {
    const where = this.buildWhereClause(criteria);
    const sql = `SELECT * FROM ${this.tableName} ${where.clause} LIMIT 1`;
    const result = await database.get<T>(sql, where.values);
    return result;
  }
}
