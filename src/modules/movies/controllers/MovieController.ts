import { Response, NextFunction } from 'express';
import { MovieService } from '../services/MovieService';
import { ResponseBuilder } from '../../../utils/responseBuilder';
import { AuthRequest } from '../../../middleware/authMiddleware';

export class MovieController {
  constructor(private movieService: MovieService) {}

  searchMovies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const keyword = req.query.keyword as string | undefined;

      const movies = await this.movieService.searchMovies(keyword);

      ResponseBuilder.success(res, movies, 'Movies retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
