import axios from 'axios';
import { Movie } from '../models/Movie';
import { TMDBMovieResponse } from '../models/TMDBResponse';
import { MovieDto } from '../dtos/MovieDto';
import { env } from '../../../config/env';
import { AppError } from '../../../middleware/errorHandler';

export class MovieService {
  private tmdbApiUrl: string;
  private tmdbApiKey: string;

  constructor() {
    this.tmdbApiUrl = env.TMDB_API_URL;
    this.tmdbApiKey = env.TMDB_API_KEY;

    if (!this.tmdbApiKey) {
      throw new AppError('TMDB API key not configured', 500);
    }
  }

  async searchMovies(keyword?: string): Promise<MovieDto[]> {
    const movies = await this.fetchFromTMDB(keyword);
    const moviesWithScores = this.addSuggestionScores(movies);
    const sortedMovies = this.sortBySuggestionScore(moviesWithScores);

    return sortedMovies.map(this.mapToDto);
  }

  async getMovieById(movieId: number): Promise<Movie> {
    const endpoint = `${this.tmdbApiUrl}/movie/${movieId}`;

    try {
      const response = await axios.get<Movie>(endpoint, {
        params: {
          language: 'en-US',
        },
        headers: {
          Authorization: `Bearer ${this.tmdbApiKey}`,
        },
        timeout: 5000,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new AppError(`Movie with ID ${movieId} not found in TMDB database`, 404);
        }
        if (error.response?.status === 401) {
          throw new AppError('TMDB API authentication failed', 500);
        }
        throw new AppError(
          `Failed to fetch movie from TMDB: ${error.message}`,
          error.response?.status || 500,
        );
      }
      throw error;
    }
  }

  private async fetchFromTMDB(keyword?: string): Promise<Movie[]> {
    const endpoint = keyword
      ? `${this.tmdbApiUrl}/search/movie`
      : `${this.tmdbApiUrl}/movie/popular`;

    const params: Record<string, string | number> = {
      language: 'en-US',
      page: 1,
    };

    if (keyword) {
      params.query = keyword;
    }

    const response = await axios.get<TMDBMovieResponse>(endpoint, {
      params,
      headers: {
        Authorization: `Bearer ${this.tmdbApiKey}`,
      },
      timeout: 5000,
    });

    return response.data.results;
  }

  private addSuggestionScores(movies: Movie[]): (Movie & { suggestionScore: number })[] {
    return movies.map((movie) => ({
      ...movie,
      suggestionScore: Math.floor(Math.random() * 100),
    }));
  }

  private sortBySuggestionScore(
    movies: (Movie & { suggestionScore: number })[],
  ): (Movie & { suggestionScore: number })[] {
    return movies.sort((a, b) => b.suggestionScore - a.suggestionScore);
  }

  private mapToDto(movie: Movie & { suggestionScore: number }): MovieDto {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      suggestionScore: movie.suggestionScore,
    };
  }
}
