import { DataAccess } from './DataAccess';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../modules/auth/models/User';
import { logger } from '../../utils/logger';

export class UserRepository extends DataAccess<User> implements IUserRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      return await this.findOne({ email } as Partial<User>);
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const user = await this.findByEmail(email);
      return !!user;
    } catch (error) {
      logger.error('Error checking if email exists:', error);
      throw error;
    }
  }
}
