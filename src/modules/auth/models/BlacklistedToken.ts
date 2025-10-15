import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('token_blacklist')
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  token!: string;

  @Column({ type: 'integer' })
  userId!: number;

  @Column({ type: 'datetime' })
  expiresAt!: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  blacklistedAt!: string;

  @ManyToOne(() => User, (user) => user.blacklistedTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
