import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Favorite } from '../../favorites/models/Favorite';
import { BlacklistedToken } from './BlacklistedToken';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  firstName!: string;

  @Column({ type: 'text' })
  lastName!: string;

  @Column({ type: 'text' })
  password!: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: string;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: string;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites?: Favorite[];

  @OneToMany(() => BlacklistedToken, (token) => token.user)
  blacklistedTokens?: BlacklistedToken[];
}

export type UserSafe = Omit<User, 'password'>;
