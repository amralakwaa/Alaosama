import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishingRequest, PublishRequestStatus } from '../../database/entities/publishing-request.entity';
import { CreatePublishRequestDto, UpdatePublishRequestStatusDto } from './dto/publishing-request.dto';

@Injectable()
export class PublishingRequestsService {
  constructor(
    @InjectRepository(PublishingRequest)
    private readonly repo: Repository<PublishingRequest>,
  ) {}

  // Submit a new publishing request (any user or guest)
  async create(dto: CreatePublishRequestDto, userId?: number) {
    const req = this.repo.create({ ...dto, userId });
    return this.repo.save(req);
  }

  // Get all requests (admin)
  async findAll(status?: string, page = 1, limit = 20) {
    const qb = this.repo.createQueryBuilder('pr')
      .leftJoinAndSelect('pr.user', 'user')
      .orderBy('pr.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.where('pr.status = :status', { status });

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // Get my requests (author/user)
  async findMy(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Update status (admin)
  async updateStatus(id: number, dto: UpdatePublishRequestStatusDto) {
    const req = await this.repo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('الطلب غير موجود');

    req.status = dto.status as PublishRequestStatus;
    if (dto.adminNotes) req.adminNotes = dto.adminNotes;

    return this.repo.save(req);
  }

  // Count by status for admin dashboard
  async getStats() {
    const stats = await this.repo
      .createQueryBuilder('pr')
      .select('pr.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('pr.status')
      .getRawMany();

    return stats.reduce((acc, s) => {
      acc[s.status] = parseInt(s.count);
      return acc;
    }, { sent: 0, reviewing: 0, approved: 0, needs_revision: 0, rejected: 0 });
  }
}
