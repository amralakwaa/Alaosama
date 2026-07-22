import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';
import { UpdateSettingsBatchDto } from './dto/setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly repo: Repository<PlatformSetting>,
  ) {}

  async findAll() {
    const settings = await this.repo.find();
    // Return as key-value pairs
    return settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async updateBatch(dto: UpdateSettingsBatchDto) {
    for (const item of dto.settings) {
      let setting = await this.repo.findOne({ where: { key: item.key } });
      if (setting) {
        setting.value = item.value;
      } else {
        setting = this.repo.create({ key: item.key, value: item.value });
      }
      await this.repo.save(setting);
    }
    return this.findAll();
  }

  // Pre-seed some default settings if they don't exist
  async onModuleInit() {
    const defaultSettings = [
      // Core
      { key: 'site_name', value: 'أمانات ومكتبة أسامة', type: 'text', label: 'اسم المنصة' },
      { key: 'site_description', value: 'مؤسسة يمنية تجمع بين المكتبة ودار النشر والخدمات المتنوعة، وتسعى لأن تكون الوجهة الرقمية الأولى للكتاب في اليمن.', type: 'text', label: 'وصف المؤسسة' },
      { key: 'site_logo_url', value: '/logo.png', type: 'url', label: 'رابط الشعار' },
      { key: 'favicon_url', value: '/favicon.png', type: 'url', label: 'رابط الفافيكون (favicon)' },
      { key: 'og_image_url', value: '/og-image.png', type: 'url', label: 'صورة المشاركة (Open Graph)' },
      // Contact
      { key: 'phone', value: '967780475124', type: 'text', label: 'رقم الهاتف' },
      { key: 'whatsapp_number', value: '967780475124', type: 'text', label: 'رقم الواتساب' },
      { key: 'email', value: 'info@amanat.ye', type: 'text', label: 'البريد الإلكتروني' },
      { key: 'address', value: 'اليمن - محافظة ذمار', type: 'text', label: 'العنوان' },
      { key: 'working_hours', value: 'السبت - الخميس: 8ص - 8م', type: 'text', label: 'ساعات العمل' },
      // Social Media
      { key: 'instagram_url', value: '', type: 'url', label: 'رابط Instagram' },
      { key: 'facebook_url', value: '', type: 'url', label: 'رابط Facebook' },
      { key: 'tiktok_url', value: '', type: 'url', label: 'رابط TikTok' },
      // Google Maps
      { key: 'google_map_url', value: 'https://maps.app.goo.gl/4PK2W78ACY73pXkt8', type: 'url', label: 'رابط Google Maps' },
      { key: 'map_latitude', value: '14.564790973375231', type: 'text', label: 'خط العرض (Latitude)' },
      { key: 'map_longitude', value: '44.38898091291654', type: 'text', label: 'خط الطول (Longitude)' },
      { key: 'map_enabled', value: 'true', type: 'text', label: 'تفعيل الخريطة' },
      // Google Business
      { key: 'google_business_url', value: '', type: 'url', label: 'رابط Google Business Profile' },
      { key: 'google_site_verification', value: '', type: 'text', label: 'Google Site Verification Code' },
    ];

    for (const def of defaultSettings) {
      const exists = await this.repo.findOne({ where: { key: def.key } });
      if (!exists) {
        await this.repo.save(this.repo.create(def));
      }
    }
  }
}
