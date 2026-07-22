import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { AuthorFollow } from '../../database/entities/author-follow.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    @InjectRepository(AuthorFollow)
    private followRepo: Repository<AuthorFollow>,
  ) {}

  async getUserNotifications(userId: number) {
    return this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async markAsRead(id: number, userId: number) {
    await this.notifRepo.update({ id, userId }, { isRead: true });
    return { success: true };
  }

  // Internal method for other services to use
  async createNotification(userId: number, message: string, link?: string) {
    const notif = this.notifRepo.create({ userId, message, link });
    return this.notifRepo.save(notif);
  }

  async notifyAuthorFollowers(authorId: number, message: string, link?: string) {
    const followers = await this.followRepo.find({ where: { authorId } });
    if (followers.length === 0) return;

    const notifications = followers.map(f => 
      this.notifRepo.create({ userId: f.userId, message, link })
    );
    await this.notifRepo.save(notifications);
  }
}
