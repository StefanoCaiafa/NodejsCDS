import { BaseRepository } from './DataAccess';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../../modules/auth/models/User';

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.findOne({ email } as Partial<User>);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}
