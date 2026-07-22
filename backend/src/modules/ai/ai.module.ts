import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Book } from '../../database/entities/book.entity';
import { User } from '../../database/entities/user.entity';
import { Category } from '../../database/entities/category.entity';
import { Review } from '../../database/entities/review.entity';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, User, Category, Review, PlatformSetting])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
