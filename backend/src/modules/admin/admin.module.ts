import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, Book, Category, ReadingProgress, AdminActivityLog, Review, ReviewReply } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Book, Category, ReadingProgress, AdminActivityLog, Review, ReviewReply])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

