import { DataAccess } from './DataAccess';
import { IFavoriteRepository } from '../interfaces/IFavoriteRepository';
import { Favorite } from '../../modules/favorites/models/Favorite';
import { database } from '../../db/database';
import { logger } from '../../utils/logger';

export class FavoriteRepository extends DataAccess<Favorite> implements IFavoriteRepository {
  constructor() {
    super('favorites');
  }

  async findByUserId(userId: number): Promise<Favorite[]> {
    try {
      return await this.findAll({ userId } as Partial<Favorite>);
    } catch (error) {
      logger.error('Error finding favorites by user ID:', error);
      throw error;
    }
  }

  async isFavorited(userId: number, movieId: number): Promise<boolean> {
    try {
      const favorite = await this.findOne({ userId, movieId } as Partial<Favorite>);
      return !!favorite;
    } catch (error) {
      logger.error('Error checking if movie is favorited:', error);
      throw error;
    }
  }

  async removeByUserAndMovie(userId: number, movieId: number): Promise<boolean> {
    try {
      const sql = `DELETE FROM ${this.tableName} WHERE userId = ? AND movieId = ?`;
      const result = await database.run(sql, [userId, movieId]);
      return (result.changes ?? 0) > 0;
    } catch (error) {
      logger.error('Error removing favorite:', error);
      throw error;
    }
  }
}
