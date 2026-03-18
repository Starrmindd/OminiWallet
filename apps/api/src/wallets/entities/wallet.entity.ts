import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  address: string;

  @Column()
  chainId: string;

  @Column({ nullable: true })
  label?: string;

  @Column({ default: 'imported' })
  type: string; // 'imported' | 'walletconnect' | 'injected'

  /**
   * Encrypted private key (AES-256, encrypted CLIENT-SIDE before sending).
   * Server stores only the encrypted blob — never the raw key.
   * For WalletConnect wallets this is null.
   */
  @Column({ nullable: true, type: 'text' })
  encryptedKey?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
