import { Repository, FindOptionsWhere, ObjectLiteral, DeepPartial } from 'typeorm';
import { IDataAccess } from '../interfaces/IDataAccess';
import { AppDataSource } from '../../db/data-source';

export abstract class BaseRepository<T extends ObjectLiteral> implements IDataAccess<T> {
  protected repository: Repository<T>;

  constructor(entityClass: new () => T) {
    this.repository = AppDataSource.getRepository(entityClass);
  }

  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as DeepPartial<T>);
    return await this.repository.save(newEntity);
  }

  async findById(id: number): Promise<T | undefined> {
    return (
      (await this.repository.findOne({
        where: { id } as unknown as FindOptionsWhere<T>,
      })) ?? undefined
    );
  }

  async findAll(criteria?: Partial<T>): Promise<T[]> {
    if (criteria) {
      return await this.repository.find({
        where: criteria as unknown as FindOptionsWhere<T>,
      });
    }
    return await this.repository.find();
  }

  async update(id: number, entity: Partial<T>): Promise<T | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.repository.update(id, entity as any);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findOne(criteria: Partial<T>): Promise<T | undefined> {
    return (
      (await this.repository.findOne({
        where: criteria as unknown as FindOptionsWhere<T>,
      })) ?? undefined
    );
  }
}
