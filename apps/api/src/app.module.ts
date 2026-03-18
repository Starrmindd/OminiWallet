import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TransactionsModule } from './transactions/transactions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './auth/entities/user.entity';
import { Wallet } from './wallets/entities/wallet.entity';
import { NotificationEntity } from './notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Wallet, NotificationEntity],
      synchronize: process.env.NODE_ENV !== 'production', // use migrations in prod
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    WalletsModule,
    PortfolioModule,
    TransactionsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
