import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Book, BookStatus } from '../../database/entities';

const INITIAL_CATEGORIES = [
  { name: 'الأدب اليمني', slug: 'yemeni-literature', icon: '🖊️', sortOrder: 1, description: 'روايات وقصص وشعر يمني أصيل' },
  { name: 'الروايات والقصص', slug: 'novels', icon: '📖', sortOrder: 2, description: 'روايات عربية وعالمية مترجمة' },
  { name: 'التاريخ والتراث', slug: 'history', icon: '🏛️', sortOrder: 3, description: 'تاريخ اليمن والحضارة العربية والإسلامية' },
  { name: 'الدراسات الإسلامية', slug: 'islamic-studies', icon: '🕌', sortOrder: 4, description: 'الفقه والحديث والتفسير والعقيدة' },
  { name: 'التطوير والتعليم', slug: 'education', icon: '🎓', sortOrder: 5, description: 'كتب تعليمية ومناهج دراسية' },
  { name: 'تطوير الذات', slug: 'self-development', icon: '🧠', sortOrder: 6, description: 'كتب التحفيز والنجاح وبناء الشخصية' },
  { name: 'العلوم والتكنولوجيا', slug: 'science', icon: '🔬', sortOrder: 7, description: 'علوم تطبيقية وتقنية وبرمجة' },
  { name: 'الاقتصاد والأعمال', slug: 'business', icon: '📊', sortOrder: 8, description: 'إدارة الأعمال والتجارة والاقتصاد' },
  { name: 'الأطفال والناشئة', slug: 'children', icon: '🌟', sortOrder: 9, description: 'كتب وقصص للأطفال والمراهقين' },
  { name: 'الشعر والأدب', slug: 'poetry', icon: '✍️', sortOrder: 10, description: 'الشعر الفصيح والشعبي والأدب العربي' },
];

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  // Auto-seed categories on startup if table is empty
  async onModuleInit() {
    const count = await this.categoryRepository.count();
    if (count === 0) {
      await this.categoryRepository.save(
        INITIAL_CATEGORIES.map((c) => this.categoryRepository.create(c)),
      );
      console.log('✅ Categories seeded successfully');
    }
  }

  findAll() {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      select: ['id', 'name', 'slug', 'icon', 'booksCount'],
    });
  }

  // Returns categories with live book counts from DB
  async findAllWithCounts() {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
      select: ['id', 'name', 'slug', 'icon', 'description', 'booksCount'],
    });

    // Get live counts for approved books per category
    const counts = await this.bookRepository
      .createQueryBuilder('book')
      .select('book.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('book.status = :status', { status: BookStatus.APPROVED })
      .groupBy('book.categoryId')
      .getRawMany();

    const countMap = new Map(counts.map((c) => [c.categoryId, parseInt(c.count)]));
    return categories.map((cat) => ({
      ...cat,
      booksCount: countMap.get(cat.id) ?? 0,
    }));
  }

  findBySlug(slug: string) {
    return this.categoryRepository.findOne({ where: { slug, isActive: true } });
  }

  async create(name: string, slug: string, icon: string, description: string) {
    const category = this.categoryRepository.create({ name, slug, icon, description, sortOrder: 99 });
    return this.categoryRepository.save(category);
  }

  async update(id: number, data: { name?: string; slug?: string; icon?: string; description?: string }) {
    await this.categoryRepository.update(id, data);
    return this.categoryRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id);
    return { success: true };
  }
}
