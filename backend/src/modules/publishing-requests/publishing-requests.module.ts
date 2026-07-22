import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublishingRequest } from '../../database/entities/publishing-request.entity';
import { PublishingRequestsController } from './publishing-requests.controller';
import { PublishingRequestsService } from './publishing-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([PublishingRequest])],
  controllers: [PublishingRequestsController],
  providers: [PublishingRequestsService],
  exports: [PublishingRequestsService],
})
export class PublishingRequestsModule {}
