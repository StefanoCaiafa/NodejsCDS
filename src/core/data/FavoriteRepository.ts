import { DataAccess } from './DataAccess';
import { IFavoriteRepository } from '../interfaces/IFavoriteRepository';
import { Favorite } from '../../modules/favorites/models/Favorite';
import { database } from '../../db/database';

export class FavoriteRepository extends DataAccess<Favorite> implements IFavoriteRepository {
  constructor() {
    super('favorites');
  }

  async findByUserId(userId: number): Promise<Favorite[]> {
    return await this.findAll({ userId } as Partial<Favorite>);
  }

  async isFavorited(userId: number, movieId: number): Promise<boolean> {
    const favorite = await this.findOne({ userId, movieId } as Partial<Favorite>);
    return !!favorite;
  }

  async removeByUserAndMovie(userId: number, movieId: number): Promise<boolean> {
    const sql = `DELETE FROM ${this.tableName} WHERE userId = ? AND movieId = ?`;
    const result = await database.run(sql, [userId, movieId]);
    return (result.changes ?? 0) > 0;
  }
}
