import { DataAccess } from './DataAccess';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../modules/auth/models/User';

export class UserRepository extends DataAccess<User> implements IUserRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ email } as Partial<User>);
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return !!user;
  }
}
