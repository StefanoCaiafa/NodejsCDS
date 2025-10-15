import { IFavoriteRepository } from '../../../core/interfaces/IFavoriteRepository';
import { Favorite } from '../models/Favorite';
import { FavoriteDto, AddFavoriteDto } from '../dtos/FavoriteDto';
import { logger } from '../../../utils/logger';
import { AppError } from '../../../middleware/errorHandler';

export class FavoriteService {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async addFavorite(userId: number, movieDto: AddFavoriteDto): Promise<Favorite> {
    try {
      const alreadyFavorited = await this.favoriteRepository.isFavorited(userId, movieDto.id);
      if (alreadyFavorited) {
        throw new AppError('Movie already in favorites', 400);
      }

      const favorite = await this.favoriteRepository.create({
        userId,
        movieId: movieDto.id,
        title: movieDto.title,
        overview: movieDto.overview || null,
        posterPath: movieDto.poster_path || null,
        releaseDate: movieDto.release_date || null,
        voteAverage: movieDto.vote_average || null,
        movieData: JSON.stringify(movieDto),
      });

      logger.info(`User ${userId} added movie ${movieDto.id} to favorites`);
      return favorite;
    } catch (error) {
      logger.error('Error adding favorite:', error);
      throw error;
    }
  }

  async getFavorites(userId: number): Promise<FavoriteDto[]> {
    try {
      const favorites = await this.favoriteRepository.findByUserId(userId);

      const favoritesWithScores = this.addSuggestionScores(favorites);
      const sortedFavorites = this.sortByScore(favoritesWithScores);

      return sortedFavorites.map(this.mapToDto);
    } catch (error) {
      logger.error('Error getting favorites:', error);
      throw error;
    }
  }

  async removeFavorite(userId: number, movieId: number): Promise<boolean> {
    try {
      const removed = await this.favoriteRepository.removeByUserAndMovie(userId, movieId);

      if (!removed) {
        throw new AppError('Favorite not found', 404);
      }

      logger.info(`User ${userId} removed movie ${movieId} from favorites`);
      return removed;
    } catch (error) {
      logger.error('Error removing favorite:', error);
      throw error;
    }
  }

  private addSuggestionScores(
    favorites: Favorite[],
  ): (Favorite & { suggestionForTodayScore: number })[] {
    return favorites.map((favorite) => ({
      ...favorite,
      suggestionForTodayScore: Math.floor(Math.random() * 100),
    }));
  }

  private sortByScore(
    favorites: (Favorite & { suggestionForTodayScore: number })[],
  ): (Favorite & { suggestionForTodayScore: number })[] {
    return favorites.sort((a, b) => b.suggestionForTodayScore - a.suggestionForTodayScore);
  }

  private mapToDto(favorite: Favorite & { suggestionForTodayScore: number }): FavoriteDto {
    return {
      id: favorite.id,
      movieId: favorite.movieId,
      title: favorite.title,
      overview: favorite.overview,
      posterPath: favorite.posterPath,
      releaseDate: favorite.releaseDate,
      voteAverage: favorite.voteAverage,
      addedAt: favorite.addedAt,
      suggestionForTodayScore: favorite.suggestionForTodayScore,
    };
  }
}
