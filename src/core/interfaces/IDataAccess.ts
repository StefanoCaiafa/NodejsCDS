export interface IDataAccess<T> {
  create(entity: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | undefined>;
  findAll(criteria?: Partial<T>): Promise<T[]>;
  update(id: number, entity: Partial<T>): Promise<T | undefined>;
  delete(id: number): Promise<boolean>;
  findOne(criteria: Partial<T>): Promise<T | undefined>;
}
