import { Movie } from './Movie';

/**
 * TMDB API Response structure
 * Represents the paginated response from TMDB API
 */
export interface TMDBMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
