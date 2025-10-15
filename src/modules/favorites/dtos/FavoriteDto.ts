export interface FavoriteDto {
  id: number;
  movieId: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  addedAt: string;
  suggestionForTodayScore: number;
}

export interface AddFavoriteDto {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  [key: string]: string | number | undefined;
}
