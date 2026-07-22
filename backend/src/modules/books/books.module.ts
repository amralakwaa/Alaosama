import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { UploadService } from './upload.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { Book, AdminActivityLog } from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, AdminActivityLog]),
    NotificationsModule
  ],
  controllers: [BooksController],
  providers: [BooksService, UploadService],
  exports: [BooksService, UploadService],
})
export class BooksModule {}
