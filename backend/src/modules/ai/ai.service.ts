import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Book, BookStatus } from '../../database/entities/book.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { Category } from '../../database/entities/category.entity';
import { Review, ReviewStatus } from '../../database/entities/review.entity';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(PlatformSetting) private settingsRepo: Repository<PlatformSetting>,
    private config: ConfigService,
  ) {}

  // ══════════════════════════════════════════════════════
  // PUBLIC READER ASSISTANT (RAG)
  // ══════════════════════════════════════════════════════
  async chatWithLibrary(message: string): Promise<{ text: string; books: any[]; actions: string[] }> {
    // 1. Detect if the user is asking for books or just chatting
    const isGreeting = /^(مرحبا|السلام عليكم|كيف حالك|اهلا|هلا|صباح الخير|مساء الخير|شكرا|يعطيك العافية|هلا والله|مرحباً)[\s؟!.]*$/i.test(message.trim());
    const isBookIntent = /(كتاب|كتب|رواية|قصة|اقترح|اريد|أريد|ابحث|أبحث|عن|مؤلف|كاتب|قسم|تصنيف|روايات|قصص|مكتبة|موسوعة|قراءة|اقرأ)/i.test(message);

    let books: Book[] = [];
    let context = '';
    let keywords: string[] = [];

    if (!isGreeting || isBookIntent) {
      keywords = this.extractKeywords(message);
      if (keywords.length > 0 || isBookIntent) {
        books = await this.searchBooks(keywords, message, isBookIntent);
        context = this.buildBooksContext(books, message);
      }
    }

    // 4. Call Groq with the context (RAG)
    const systemPrompt = `أنت مساعد ذكي لمكتبة أسامة الرقمية. تتمتع بشخصية متعاطفة، ذكية، وودودة جداً (تشبه شخصية ChatGPT).
- هدفك هو بناء حوار إنساني وطبيعي مع المستخدم، والإجابة عن أسئلته العامة من قاعدة معرفتك الواسعة.
- أنت لست مجرد أداة للبحث، بل رفيق للقارئ. افهم مشاعر المستخدم وتفاعل معها بلطف.
- أجب دائماً بالعربية الفصحى الواضحة والجميلة.
- إذا كان السؤال عاماً أو علمياً أو ثقافياً، أجب عليه بثقة من معرفتك العامة.
- إذا طلب المستخدم اقتراح كتب أو سأل عن كتب معينة، فابحث في السياق المرفق (Context) واقترح ما يناسبه من مكتبة أسامة.
- لا تؤلف تفاصيل عن الكتب الموجودة في المكتبة، اعتمد فقط على السياق المرفق عند الحديث عن كتب المكتبة.`;

    const userPrompt = context
      ? `سؤال القارئ: "${message}"\n\nالكتب المتاحة في المكتبة ذات الصلة:\n${context}\n\nأجب على القارئ بطبيعية وود، واستفد من الكتب أعلاه إذا كانت ذات صلة بسؤاله.`
      : `سؤال القارئ: "${message}"\n\nأجب على هذا السؤال بكل ود وثقة من خلال معرفتك العامة، وبدون أن تذكر أنك لم تجد كتباً أو بيانات.`;

    const aiText = await this.callGroq(systemPrompt, userPrompt);

    return {
      text: aiText,
      books: books.slice(0, 6).map(b => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        coverImageUrl: b.coverImageUrl,
        authorName: (b.author as any)?.name || 'غير معروف',
        categoryName: (b.category as any)?.name || '',
        isPremium: b.isPremium,
        averageRating: b.averageRating,
        description: b.description?.substring(0, 120),
      })),
      actions: books.length > 0 ? ['view_book', 'add_favorite', 'view_author'] : ['search_books'],
    };
  }

  // ══════════════════════════════════════════════════════
  // AUTHOR ASSISTANT
  // ══════════════════════════════════════════════════════
  async assistAuthor(authorId: number, bookTitle: string, description: string, category: string, action: string): Promise<{ text: string; suggestions?: string[] }> {
    const categories = await this.categoryRepo.find({ select: ['name'] });
    const categoryNames = categories.map(c => c.name).join('، ');

    let systemPrompt: string;
    let userPrompt: string;

    switch (action) {
      case 'generate_meta':
        systemPrompt = `أنت مؤلف عربي مبدع وخبير في صياغة عناوين وأوصاف جذابة للكتب. أجب بالعربية فقط.`;
        userPrompt = `قم بتأليف عنوان شيق ووصف احترافي (100-150 كلمة) لكتاب يتحدث عن الموضوع التالي:
"${bookTitle}"

يجب أن يكون الرد بالتنسيق التالي حرفياً وبدون أي إضافات:
العنوان: [عنوان الكتاب الجذاب]
الوصف: [الوصف الجذاب هنا]`;
        break;

      case 'improve_description':
        systemPrompt = `أنت محرر أدبي محترف متخصص في تحسين أوصاف الكتب العربية. أجب بالعربية فقط.`;
        userPrompt = `حسّن وصف الكتاب التالي بأسلوب احترافي جذاب يشجع القراء على القراءة (150-200 كلمة):

عنوان الكتاب: "${bookTitle}"
الوصف الحالي: "${description || 'لا يوجد وصف'}"
التصنيف: "${category || 'غير محدد'}"

قدم الوصف المحسّن مباشرة بدون مقدمات.`;
        break;

      case 'generate_keywords':
        systemPrompt = `أنت خبير SEO متخصص في المحتوى العربي. أجب بالعربية فقط.`;
        userPrompt = `استخرج 8-10 كلمات مفتاحية SEO لكتاب بعنوان: "${bookTitle}"
الوصف: "${description?.substring(0, 300) || ''}"
التصنيف: "${category || ''}"

قدمها كقائمة مرقمة، كل كلمة في سطر.`;
        break;

      case 'suggest_category':
        systemPrompt = `أنت أمين مكتبة خبير في تصنيف الكتب العربية.`;
        userPrompt = `اقترح أنسب تصنيف لهذا الكتاب من التصنيفات المتاحة:

عنوان الكتاب: "${bookTitle}"
الوصف: "${description?.substring(0, 400) || ''}"

التصنيفات المتاحة: ${categoryNames}

أجب باسم التصنيف المناسب فقط مع سبب قصير (جملة واحدة).`;
        break;

      case 'review_book':
        systemPrompt = `أنت مراجع أدبي متخصص يساعد المؤلفين قبل نشر كتبهم.`;
        userPrompt = `راجع بيانات الكتاب التالي وأعطِ توصيات لتحسينه:

العنوان: "${bookTitle}"
الوصف: "${description?.substring(0, 500) || 'غير متوفر'}"
التصنيف: "${category || 'غير محدد'}"

قدم:
1. تقييم نقاط القوة
2. نقاط تحتاج تحسين
3. توصيات محددة`;
        break;

      default:
        systemPrompt = `أنت مساعد المؤلف في مكتبة أسامة الرقمية.`;
        userPrompt = bookTitle || 'مساعدة عامة';
    }

    const aiText = await this.callGroq(systemPrompt, userPrompt);
    return { text: aiText };
  }

  // ══════════════════════════════════════════════════════
  // ADMIN INSIGHTS ASSISTANT
  // ══════════════════════════════════════════════════════
  async getAdminInsights(query: string): Promise<{ text: string; data?: any }> {
    // Fetch real platform stats
    const [totalBooks, totalAuthors, topBooks, recentReviews] = await Promise.all([
      this.bookRepo.count({ where: { status: BookStatus.APPROVED } }),
      this.userRepo.count({ where: { role: UserRole.AUTHOR } }),
      this.bookRepo.find({
        where: { status: BookStatus.APPROVED },
        order: { viewCount: 'DESC' },
        take: 5,
        select: ['title', 'viewCount', 'downloadCount', 'averageRating', 'reviewsCount'],
      }),
      this.reviewRepo.find({
        where: { status: ReviewStatus.APPROVED },
        order: { createdAt: 'DESC' },
        take: 10,
        select: ['rating', 'comment'],
      }),
    ]);

    const avgRating = recentReviews.length > 0
      ? (recentReviews.reduce((s, r) => s + r.rating, 0) / recentReviews.length).toFixed(2)
      : 'غير متاح';

    const statsContext = `
إحصائيات المنصة الحالية:
- إجمالي الكتب المنشورة: ${totalBooks}
- إجمالي المؤلفين: ${totalAuthors}
- متوسط تقييم المستخدمين الأخير: ${avgRating}/5

أكثر الكتب مشاهدة:
${topBooks.map((b, i) => `${i + 1}. "${b.title}" - ${b.viewCount} مشاهدة، ${b.downloadCount} تحميل، تقييم ${b.averageRating}`).join('\n')}

آخر التقييمات (نماذج):
${recentReviews.slice(0, 3).map(r => `- تقييم ${r.rating}/5: "${r.comment?.substring(0, 80)}"`).join('\n')}
`;

    const systemPrompt = `أنت محلل بيانات ذكي لمنصة مكتبة أسامة الرقمية. تحلل البيانات الحقيقية للمنصة وتقدم رؤى واضحة للإدارة. أجب بالعربية.`;
    const userPrompt = `استفسار الإدارة: "${query}"

${statsContext}

قدم تحليلاً دقيقاً مع توصيات عملية قابلة للتطبيق.`;

    const aiText = await this.callGroq(systemPrompt, userPrompt);
    return {
      text: aiText,
      data: { totalBooks, totalAuthors, avgRating, topBooks },
    };
  }

  // ══════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════════════

  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    // Attempt to read from database first
    const dbApiKey = await this.settingsRepo.findOne({ where: { key: 'groq_api_key' } });
    const dbModel = await this.settingsRepo.findOne({ where: { key: 'groq_model' } });
    const dbBaseUrl = await this.settingsRepo.findOne({ where: { key: 'ai_base_url' } });

    const apiKey = dbApiKey?.value || this.config.get<string>('GROQ_API_KEY');
    const model = dbModel?.value || this.config.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    const baseUrl = dbBaseUrl?.value || 'https://api.groq.com/openai/v1/chat/completions';
    const maxTokens = parseInt(this.config.get<string>('AI_MAX_TOKENS') || '1024');

    if (!apiKey) {
      this.logger.error('Groq API Key is missing');
      return 'عذراً، المساعد الذكي غير متوفر حالياً بسبب نقص في الإعدادات.';
    }

    try {
      const response = await axios.post(
        baseUrl,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      return response.data?.choices?.[0]?.message?.content || 'عذراً، لم أستطع معالجة طلبك. يرجى المحاولة مجدداً.';
    } catch (error) {
      this.logger.error('Groq API error:', error?.response?.data || error.message);
      if (error?.response?.status === 429) {
        return 'عذراً، المساعد مشغول حالياً. يرجى المحاولة بعد لحظات.';
      }
      return 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.';
    }
  }

  private extractKeywords(text: string): string[] {
    // Remove Arabic stop words and extract meaningful words
    const stopWords = ['في', 'من', 'على', 'إلى', 'عن', 'مع', 'هل', 'أريد', 'أبحث', 'كتاب', 'كتب', 'أجد', 'هناك', 'لدي', 'يوجد', 'عندكم'];
    return text
      .replace(/[،؟!.]/g, ' ')
      .split(' ')
      .filter(w => w.length > 2 && !stopWords.includes(w))
      .slice(0, 6);
  }

  private async searchBooks(keywords: string[], fullMessage: string, forceFallback: boolean = false): Promise<Book[]> {
    if (keywords.length === 0) {
      if (!forceFallback) return [];
      
      return this.bookRepo.find({
        where: { status: BookStatus.APPROVED },
        order: { viewCount: 'DESC' },
        take: 8,
        relations: ['author', 'category'],
      });
    }

    // Build OR conditions for keyword matching in title and description
    const results: Book[] = [];
    const seen = new Set<number>();

    for (const kw of keywords.slice(0, 3)) {
      const found = await this.bookRepo.find({
        where: [
          { status: BookStatus.APPROVED, title: Like(`%${kw}%`) },
          { status: BookStatus.APPROVED, description: Like(`%${kw}%`) },
        ],
        relations: ['author', 'category'],
        take: 6,
        order: { averageRating: 'DESC' },
      });
      found.forEach(b => {
        if (!seen.has(b.id)) { seen.add(b.id); results.push(b); }
      });
    }

    // Fallback: return top books if nothing found, but ONLY if the user actually intended to search for books
    if (results.length === 0 && forceFallback) {
      return this.bookRepo.find({
        where: { status: BookStatus.APPROVED },
        relations: ['author', 'category'],
        order: { viewCount: 'DESC' },
        take: 6,
      });
    }

    return results.slice(0, 8);
  }

  private buildBooksContext(books: Book[], query: string): string {
    if (books.length === 0) return 'لا توجد كتب مطابقة في قاعدة البيانات حالياً.';

    return books.map((b, i) =>
      `${i + 1}. "${b.title}" - المؤلف: ${(b.author as any)?.name || 'غير معروف'} | التصنيف: ${(b.category as any)?.name || 'عام'} | التقييم: ${b.averageRating}/5 | ${b.isPremium ? 'مدفوع' : 'مجاني'}\n   الوصف: ${b.description?.substring(0, 150) || 'لا يوجد وصف'}`
    ).join('\n\n');
  }
}
