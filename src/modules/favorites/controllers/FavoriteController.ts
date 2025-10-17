import { Response, NextFunction } from 'express';
import { FavoriteService } from '../services/FavoriteService';
import { ResponseBuilder } from '../../../utils/responseBuilder';
import { AuthRequest } from '../../../middleware/authMiddleware';

export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  addFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { movieId } = req.body;

      if (movieId === undefined || movieId === null) {
        ResponseBuilder.error(res, 'Invalid request. movieId is required.', 400);
        return;
      }

      if (typeof movieId !== 'number' || !Number.isInteger(movieId) || movieId <= 0) {
        ResponseBuilder.error(res, 'Invalid request. movieId must be a positive integer.', 400);
        return;
      }

      const favorite = await this.favoriteService.addFavorite(userId, { movieId });

      ResponseBuilder.created(res, favorite, 'Movie added to favorites');
    } catch (error) {
      next(error);
    }
  };

  getFavorites = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const favorites = await this.favoriteService.getFavorites(userId);

      ResponseBuilder.success(res, favorites, 'Favorites retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        ResponseBuilder.error(res, 'Invalid movie ID', 400);
        return;
      }

      await this.favoriteService.removeFavorite(userId, movieId);

      ResponseBuilder.success(res, null, 'Favorite removed successfully');
    } catch (error) {
      next(error);
    }
  };
}
