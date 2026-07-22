import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, ReadingProgress, Book, Favorite } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, ReadingProgress, Book, Favorite])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
