import { TokenBlacklistCleanupService } from './TokenBlacklistCleanupService';
import { ITokenBlacklistRepository } from '../../../core/interfaces/ITokenBlacklistRepository';

jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TokenBlacklistCleanupService', () => {
  let cleanupService: TokenBlacklistCleanupService;
  let mockRepository: jest.Mocked<ITokenBlacklistRepository>;

  beforeEach(() => {
    mockRepository = {
      addToBlacklist: jest.fn(),
      isBlacklisted: jest.fn(),
      cleanupExpired: jest.fn(),
    };

    cleanupService = new TokenBlacklistCleanupService(mockRepository);
  });

  afterEach(() => {
    cleanupService.stop();
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should start the cleanup cron job with default schedule', () => {
      cleanupService.start();

      cleanupService.start();

      expect(cleanupService['cronJob']).toBeTruthy();
    });

    it('should start the cleanup cron job with custom schedule', () => {
      cleanupService.start('*/5 * * * *');

      expect(cleanupService['cronJob']).toBeTruthy();
    });
  });

  describe('stop', () => {
    it('should stop the cleanup cron job', () => {
      cleanupService.start();
      expect(cleanupService['cronJob']).toBeTruthy();

      cleanupService.stop();
      expect(cleanupService['cronJob']).toBeNull();
    });

    it('should handle stop when no cron job is running', () => {
      expect(() => cleanupService.stop()).not.toThrow();
    });
  });

  describe('runCleanup', () => {
    it('should call repository cleanupExpired and return count', async () => {
      mockRepository.cleanupExpired.mockResolvedValue(5);

      const result = await cleanupService.runCleanup();

      expect(mockRepository.cleanupExpired).toHaveBeenCalledTimes(1);
      expect(result).toBe(5);
    });

    it('should handle cleanup with zero expired tokens', async () => {
      mockRepository.cleanupExpired.mockResolvedValue(0);

      const result = await cleanupService.runCleanup();

      expect(mockRepository.cleanupExpired).toHaveBeenCalledTimes(1);
      expect(result).toBe(0);
    });

    it('should propagate errors from repository', async () => {
      const error = new Error('Database error');
      mockRepository.cleanupExpired.mockRejectedValue(error);

      await expect(cleanupService.runCleanup()).rejects.toThrow('Database error');
    });
  });
});
