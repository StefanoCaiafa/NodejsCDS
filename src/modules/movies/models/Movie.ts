/**
 * Movie model - Represents movie data from TMDB API
 * This is NOT a database entity, just a TypeScript interface
 * for external API data
 */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  original_language: string;
  genre_ids: number[];
  suggestionScore?: number;
}
