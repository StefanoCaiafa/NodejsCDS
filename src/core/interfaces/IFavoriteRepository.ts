import { IDataAccess } from './IDataAccess';
import { Favorite } from '../../modules/favorites/models/Favorite';

export interface IFavoriteRepository extends IDataAccess<Favorite> {
  findByUserId(userId: number): Promise<Favorite[]>;
  isFavorited(userId: number, movieId: number): Promise<boolean>;
  removeByUserAndMovie(userId: number, movieId: number): Promise<boolean>;
}
