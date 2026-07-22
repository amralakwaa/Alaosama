import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { User, AuthorFollow, Book } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuthorFollow, Book])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
