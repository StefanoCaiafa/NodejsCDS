import { IDataAccess } from './IDataAccess';
import { User } from '../../modules/auth/models/User';

export interface IUserRepository extends IDataAccess<User> {
  findByEmail(email: string): Promise<User | undefined>;
  emailExists(email: string): Promise<boolean>;
}
