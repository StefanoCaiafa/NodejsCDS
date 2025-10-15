import { CryptoUtil } from '../utils/crypto';

describe('CryptoUtil', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await CryptoUtil.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await CryptoUtil.hashPassword(password);
      const hash2 = await CryptoUtil.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await CryptoUtil.hashPassword(password);
      const result = await CryptoUtil.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hash = await CryptoUtil.hashPassword(password);
      const result = await CryptoUtil.comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });
  });
});
