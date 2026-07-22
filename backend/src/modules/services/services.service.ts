import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../database/entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
  ) {}

  async findAll(activeOnly = false) {
    const qb = this.repo.createQueryBuilder('s').orderBy('s.displayOrder', 'ASC');
    if (activeOnly) {
      qb.where('s.isActive = true');
    }
    return qb.getMany();
  }

  async findOne(id: number) {
    const service = await this.repo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const service = this.repo.create(dto);
    return this.repo.save(service);
  }

  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.repo.save(service);
  }

  async remove(id: number) {
    const service = await this.findOne(id);
    return this.repo.remove(service);
  }
}
