import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { Movie } from '../models/Movie';
import { TMDBMovieResponse } from '../models/TMDBResponse';
import { MovieDto } from '../dtos/MovieDto';
import { env } from '../../../config/env';
import { logger } from '../../../utils/logger';

export class MovieService {
  private tmdbApiUrl: string;
  private tmdbApiKey: string;

  constructor() {
    this.tmdbApiUrl = env.TMDB_API_URL;
    this.tmdbApiKey = env.TMDB_API_KEY;
  }

  async searchMovies(keyword?: string): Promise<MovieDto[]> {
    try {
      let movies: Movie[] = [];

      if (this.tmdbApiKey) {
        try {
          movies = await this.fetchFromTMDB(keyword);
        } catch (error) {
          logger.warn('TMDB API unavailable, using local fallback');
          movies = await this.fetchFromLocalFallback();
        }
      } else {
        logger.warn('TMDB API key not configured, using local fallback');
        movies = await this.fetchFromLocalFallback();
      }

      const moviesWithScores = this.addSuggestionScores(movies);
      const sortedMovies = this.sortBySuggestionScore(moviesWithScores);

      return sortedMovies.map(this.mapToDto);
    } catch (error) {
      logger.error('Error searching movies:', error);
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

    logger.info(`Fetched ${response.data.results.length} movies from TMDB`);
    return response.data.results;
  }

  private async fetchFromLocalFallback(): Promise<Movie[]> {
    try {
      // In development: src/modules/movies/services -> ../../../../data/movies.json
      // In production: dist/modules/movies/services -> ../../../../data/movies.json
      const fallbackPath = path.join(__dirname, '../../../../data/movies.json');
      const data = fs.readFileSync(fallbackPath, 'utf-8');
      const parsed = JSON.parse(data);

      logger.info('Loaded movies from local fallback');
      return parsed.results || parsed;
    } catch (error) {
      logger.error('Error reading local fallback:', error);
      return [];
    }
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
