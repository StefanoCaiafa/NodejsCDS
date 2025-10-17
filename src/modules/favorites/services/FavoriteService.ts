import { IFavoriteRepository } from '../../../core/interfaces/IFavoriteRepository';
import { Favorite } from '../models/Favorite';
import { FavoriteDto, AddFavoriteDto } from '../dtos/FavoriteDto';
import { AppError } from '../../../middleware/errorHandler';
import { MovieService } from '../../movies/services/MovieService';

export class FavoriteService {
  private movieService: MovieService;

  constructor(private favoriteRepository: IFavoriteRepository) {
    this.movieService = new MovieService();
  }

  async addFavorite(userId: number, dto: AddFavoriteDto): Promise<Favorite> {
    const alreadyFavorited = await this.favoriteRepository.isFavorited(userId, dto.movieId);
    if (alreadyFavorited) {
      throw new AppError('Movie already in favorites', 400);
    }

    const movieData = await this.movieService.getMovieById(dto.movieId);

    const favorite = await this.favoriteRepository.create({
      userId,
      movieId: movieData.id,
      title: movieData.title,
      overview: movieData.overview || null,
      posterPath: movieData.poster_path || null,
      releaseDate: movieData.release_date || null,
      voteAverage: movieData.vote_average || null,
      movieData: JSON.stringify(movieData),
    });

    return favorite;
  }

  async getFavorites(userId: number): Promise<FavoriteDto[]> {
    const favorites = await this.favoriteRepository.findByUserId(userId);

    const favoritesWithScores = this.addSuggestionScores(favorites);
    const sortedFavorites = this.sortByScore(favoritesWithScores);

    return sortedFavorites.map(this.mapToDto);
  }

  async removeFavorite(userId: number, movieId: number): Promise<boolean> {
    const removed = await this.favoriteRepository.removeByUserAndMovie(userId, movieId);

    if (!removed) {
      throw new AppError('Favorite not found', 404);
    }

    return removed;
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
