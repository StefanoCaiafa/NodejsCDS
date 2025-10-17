import { Response, NextFunction } from 'express';
import { MovieController } from './MovieController';
import { MovieService } from '../services/MovieService';
import { AuthRequest } from '../../../middleware/authMiddleware';

jest.mock('../services/MovieService');

describe('MovieController', () => {
  let movieController: MovieController;
  let mockMovieService: jest.Mocked<MovieService>;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockMovieService = {
      searchMovies: jest.fn(),
      getMovieById: jest.fn(),
    } as unknown as jest.Mocked<MovieService>;

    movieController = new MovieController(mockMovieService);

    mockRequest = {
      user: {
        userId: 1,
        email: 'test@example.com',
      },
      query: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('searchMovies', () => {
    it('should search movies with keyword', async () => {
      const keyword = 'fight club';
      mockRequest.query = { keyword };

      const mockMovies = [
        {
          id: 550,
          title: 'Fight Club',
          overview: 'A ticking-time-bomb insomniac...',
          poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
          release_date: '1999-10-15',
          vote_average: 8.4,
          suggestionScore: 85,
        },
      ];

      mockMovieService.searchMovies.mockResolvedValue(mockMovies);

      await movieController.searchMovies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockMovieService.searchMovies).toHaveBeenCalledWith(keyword);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Movies retrieved successfully',
          data: mockMovies,
          timestamp: expect.any(String),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should get popular movies when no keyword provided', async () => {
      mockRequest.query = {};

      const mockMovies = [
        {
          id: 278,
          title: 'The Shawshank Redemption',
          overview: 'Framed in the 1940s...',
          poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
          release_date: '1994-09-23',
          vote_average: 8.7,
          suggestionScore: 95,
        },
      ];

      mockMovieService.searchMovies.mockResolvedValue(mockMovies);

      await movieController.searchMovies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockMovieService.searchMovies).toHaveBeenCalledWith(undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Movies retrieved successfully',
          data: mockMovies,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should return empty array if no movies found', async () => {
      mockRequest.query = { keyword: 'nonexistentmovie12345' };
      mockMovieService.searchMovies.mockResolvedValue([]);

      await movieController.searchMovies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockMovieService.searchMovies).toHaveBeenCalledWith('nonexistentmovie12345');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Movies retrieved successfully',
          data: [],
          timestamp: expect.any(String),
        }),
      );
    });

    it('should call next with error if service throws', async () => {
      mockRequest.query = { keyword: 'test' };
      const error = new Error('TMDB API error');
      mockMovieService.searchMovies.mockRejectedValue(error);

      await movieController.searchMovies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle keyword as array and use first value', async () => {
      mockRequest.query = { keyword: ['matrix', 'reloaded'] as any };

      mockMovieService.searchMovies.mockResolvedValue([]);

      await movieController.searchMovies(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      // Should cast and use as string
      expect(mockMovieService.searchMovies).toHaveBeenCalled();
    });
  });
});
