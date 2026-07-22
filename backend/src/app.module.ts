import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { AdminModule } from './modules/admin/admin.module';
import { PublishingRequestsModule } from './modules/publishing-requests/publishing-requests.module';
import { ServicesModule } from './modules/services/services.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Static Files for Uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // points to backend/public
      serveRoot: '/public',
      serveStaticOptions: {
        index: false,
      },
    }),

    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'orion_user',
      password: process.env.DB_PASSWORD || 'orion_pass_2024',
      database: process.env.DB_NAME || 'orion_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Force sync to fix missing columns on hostinger
      charset: 'utf8mb4',
      logging: process.env.NODE_ENV !== 'production',
    }),

    // Feature modules
    AuthModule,
    AdminModule,
    HealthModule,
    UsersModule,
    BooksModule,
    CategoriesModule,
    PublishingRequestsModule,
    ServicesModule,
    SettingsModule,
    AuthorsModule,
    NotificationsModule,
    UploadModule,
    ReviewsModule,
    AiModule,
  ],
  providers: [
    // Global JWT guard — all routes protected by default
    // Use @Public() decorator to allow unauthenticated access
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
