import { Response, NextFunction } from 'express';
import { FavoriteController } from './FavoriteController';
import { FavoriteService } from '../services/FavoriteService';
import { AuthRequest } from '../../../middleware/authMiddleware';
import { Favorite } from '../models/Favorite';

jest.mock('../services/FavoriteService');

describe('FavoriteController', () => {
  let favoriteController: FavoriteController;
  let mockFavoriteService: jest.Mocked<FavoriteService>;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockFavoriteService = {
      addFavorite: jest.fn(),
      getFavorites: jest.fn(),
      removeFavorite: jest.fn(),
    } as unknown as jest.Mocked<FavoriteService>;

    favoriteController = new FavoriteController(mockFavoriteService);

    mockRequest = {
      user: {
        userId: 1,
        email: 'test@example.com',
      },
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a favorite successfully with valid movieId', async () => {
      const movieId = 550;
      mockRequest.body = { movieId };

      const mockFavorite: Favorite = {
        id: 1,
        userId: 1,
        movieId: 550,
        title: 'Fight Club',
        overview: 'A ticking-time-bomb insomniac...',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        releaseDate: '1999-10-15',
        voteAverage: 8.4,
        movieData: '{}',
        addedAt: new Date().toISOString(),
      };

      mockFavoriteService.addFavorite.mockResolvedValue(mockFavorite);

      await favoriteController.addFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.addFavorite).toHaveBeenCalledWith(1, { movieId: 550 });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Movie added to favorites',
          data: mockFavorite,
          timestamp: expect.any(String),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if movieId is missing', async () => {
      mockRequest.body = {};

      await favoriteController.addFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.addFavorite).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request. movieId is required.',
        timestamp: expect.any(String),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if movieId is not a number', async () => {
      mockRequest.body = { movieId: 'invalid' };

      await favoriteController.addFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.addFavorite).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request. movieId must be a positive integer.',
        timestamp: expect.any(String),
      });
    });

    it('should return 400 if movieId is negative', async () => {
      mockRequest.body = { movieId: -1 };

      await favoriteController.addFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.addFavorite).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if movieId is a decimal', async () => {
      mockRequest.body = { movieId: 550.5 };

      await favoriteController.addFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.addFavorite).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should call next with error if service throws', async () => {
      mockRequest.body = { movieId: 550 };
      const error = new Error('Service error');
      mockFavoriteService.addFavorite.mockRejectedValue(error);

      await favoriteController.addFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('getFavorites', () => {
    it('should get all favorites for authenticated user', async () => {
      const mockFavorites = [
        {
          id: 1,
          movieId: 550,
          title: 'Fight Club',
          overview: 'A ticking-time-bomb insomniac...',
          posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
          releaseDate: '1999-10-15',
          voteAverage: 8.4,
          addedAt: new Date().toISOString(),
          suggestionForTodayScore: 85,
        },
        {
          id: 2,
          movieId: 13,
          title: 'Forrest Gump',
          overview: 'A man with a low IQ...',
          posterPath: '/clolk7rB5lAjs41SD0Vt6IXYLMm.jpg',
          releaseDate: '1994-07-06',
          voteAverage: 8.5,
          addedAt: new Date().toISOString(),
          suggestionForTodayScore: 92,
        },
      ];

      mockFavoriteService.getFavorites.mockResolvedValue(mockFavorites);

      await favoriteController.getFavorites(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.getFavorites).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Favorites retrieved successfully',
          data: mockFavorites,
          timestamp: expect.any(String),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return empty array if user has no favorites', async () => {
      mockFavoriteService.getFavorites.mockResolvedValue([]);

      await favoriteController.getFavorites(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.getFavorites).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Favorites retrieved successfully',
          data: [],
          timestamp: expect.any(String),
        }),
      );
    });

    it('should call next with error if service throws', async () => {
      const error = new Error('Database error');
      mockFavoriteService.getFavorites.mockRejectedValue(error);

      await favoriteController.getFavorites(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite successfully', async () => {
      mockRequest.params = { movieId: '550' };
      mockFavoriteService.removeFavorite.mockResolvedValue(true);

      await favoriteController.removeFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.removeFavorite).toHaveBeenCalledWith(1, 550);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Favorite removed successfully',
          data: null,
          timestamp: expect.any(String),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if movieId is not a valid number', async () => {
      mockRequest.params = { movieId: 'invalid' };

      await favoriteController.removeFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockFavoriteService.removeFavorite).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid movie ID',
        timestamp: expect.any(String),
      });
    });

    it('should call next with error if service throws', async () => {
      mockRequest.params = { movieId: '550' };
      const error = new Error('Not found');
      mockFavoriteService.removeFavorite.mockRejectedValue(error);

      await favoriteController.removeFavorite(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
