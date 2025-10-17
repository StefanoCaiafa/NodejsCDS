import { BaseRepository } from './DataAccess';
import { IFavoriteRepository } from '../interfaces/IFavoriteRepository';
import { Favorite } from '../../modules/favorites/models/Favorite';

export class FavoriteRepository extends BaseRepository<Favorite> implements IFavoriteRepository {
  constructor() {
    super(Favorite);
  }

  async findByUserId(userId: number): Promise<Favorite[]> {
    return await this.repository.find({ where: { userId } });
  }

  async isFavorited(userId: number, movieId: number): Promise<boolean> {
    const count = await this.repository.count({ where: { userId, movieId } });
    return count > 0;
  }

  async removeByUserAndMovie(userId: number, movieId: number): Promise<boolean> {
    const result = await this.repository.delete({ userId, movieId });
    return (result.affected ?? 0) > 0;
  }
}
