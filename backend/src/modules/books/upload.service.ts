import { Injectable } from '@nestjs/common';

/**
 * UploadService — يُنشئ Pre-signed URLs للرفع المباشر إلى S3.
 * في بيئة التطوير يُحاكي العملية محلياً.
 * في الإنتاج: يتصل بـ AWS SDK.
 */
@Injectable()
export class UploadService {
  private readonly isDev = process.env.NODE_ENV !== 'production';

  /**
   * يُنشئ رابطاً مؤقتاً للرفع المباشر إلى S3 (أو محاكاته في dev).
   * @param key   — مسار الملف داخل البucket (e.g. "books/pdf/123.pdf")
   * @param contentType — نوع MIME (application/pdf | image/jpeg)
   * @param expiresIn  — صلاحية الرابط بالثواني (افتراضي: 5 دقائق)
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 300,
  ): Promise<{ uploadUrl: string; publicUrl: string }> {
    if (this.isDev) {
      // Development mock — no real S3 needed
      const mockUploadUrl = `http://localhost:3000/api/upload/mock?key=${encodeURIComponent(key)}&expires=${Date.now() + expiresIn * 1000}`;
      const mockPublicUrl = `https://cdn.orion.example/${key}`;
      return { uploadUrl: mockUploadUrl, publicUrl: mockPublicUrl };
    }

    // Production: AWS S3 SDK
    // const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    // const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    // const client = new S3Client({ region: process.env.AWS_REGION });
    // const command = new PutObjectCommand({
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: key,
    //   ContentType: contentType,
    // });
    // const uploadUrl = await getSignedUrl(client, command, { expiresIn });
    // const publicUrl = `${process.env.CDN_URL}/${key}`;
    // return { uploadUrl, publicUrl };

    throw new Error('AWS S3 not configured in production');
  }

  /**
   * يُنشئ رابطاً مؤقتاً للتحميل (قراءة ملف PDF).
   * الرابط ينتهي بعد 15 دقيقة لمنع المشاركة.
   */
  async getPresignedDownloadUrl(key: string, expiresIn = 900): Promise<string> {
    if (this.isDev) {
      // In dev: if the key is a local path (starts with /public/), serve it directly from backend
      if (key.startsWith('/public/')) {
        return `http://localhost:3000${key}`;
      }
      // Fallback mock for S3 keys
      return `http://localhost:3000/api/upload/mock-download?key=${encodeURIComponent(key)}&expires=${Date.now() + expiresIn * 1000}`;
    }
    // Production: AWS Presigned GET URL
    throw new Error('AWS S3 not configured in production');
  }

  /** يُولّد مفتاح S3 آمناً للكتاب */
  generateBookPdfKey(bookId: number, filename: string): string {
    const ext = filename.split('.').pop() || 'pdf';
    return `books/pdf/${bookId}/original.${ext}`;
  }

  generateBookCoverKey(bookId: number): string {
    return `books/covers/${bookId}/cover.webp`;
  }
}
