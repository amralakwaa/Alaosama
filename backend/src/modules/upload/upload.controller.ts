

import {
  Controller, Post, UseInterceptors, UploadedFile,
  BadRequestException, UseGuards, Get, Query, Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { join, extname } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
const sharp = require('sharp');
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../../database/entities';
import { Response } from 'express';

// ── Directory setup ──────────────────────────────────────────────────────────
// __dirname in dist is backend/dist/modules/upload
// so we need to go up 3 levels to reach backend, then into public
const imagesDir   = join(__dirname, '..', '..', '..', 'public', 'uploads', 'images');
const thumbsDir   = join(__dirname, '..', '..', '..', 'public', 'uploads', 'thumbnails');
const avatarsDir  = join(__dirname, '..', '..', '..', 'public', 'uploads', 'avatars');
const booksDir    = join(__dirname, '..', '..', '..', 'public', 'uploads', 'books');

[imagesDir, thumbsDir, avatarsDir, booksDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ── Blocked extensions ────────────────────────────────────────────────────────
const BLOCKED_EXTENSIONS = [
  '.php', '.php3', '.php4', '.php5', '.phtml',
  '.exe', '.bat', '.cmd', '.sh', '.bash',
  '.py', '.rb', '.pl', '.cgi', '.asp', '.aspx',
  '.js', '.ts', '.htaccess', '.htpasswd',
];

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_IMAGE_MIMES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
  'image/webp', 'image/bmp', 'image/tiff',
];

// ── Magic bytes check ─────────────────────────────────────────────────────────
const IMAGE_SIGNATURES: Record<string, Buffer[]> = {
  jpg:  [Buffer.from([0xff, 0xd8, 0xff])],
  png:  [Buffer.from([0x89, 0x50, 0x4e, 0x47])],
  gif:  [Buffer.from([0x47, 0x49, 0x46, 0x38])],
  webp: [Buffer.from([0x52, 0x49, 0x46, 0x46])],
  bmp:  [Buffer.from([0x42, 0x4d])],
  pdf:  [Buffer.from([0x25, 0x50, 0x44, 0x46])],
};

function isValidImageBuffer(buffer: Buffer): boolean {
  for (const sigs of Object.values(IMAGE_SIGNATURES)) {
    for (const sig of sigs) {
      if (buffer.subarray(0, sig.length).equals(sig)) return true;
    }
  }
  return false;
}

function isValidPdfBuffer(buffer: Buffer): boolean {
  const sig = IMAGE_SIGNATURES.pdf[0];
  return buffer.subarray(0, sig.length).equals(sig);
}

function secureFilename(ext: string): string {
  return crypto.randomBytes(18).toString('hex') + ext;
}

/** Shared multer file filter for images */
function imageFileFilter(_req: any, file: any, cb: any) {
  // 1. MIME type must be image/*
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    return cb(new BadRequestException('يُسمح بالصور فقط (JPEG, PNG, GIF, WebP, BMP)'), false);
  }
  // 2. Block dangerous extensions
  const ext = extname(file.originalname).toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return cb(new BadRequestException(`الامتداد ${ext} غير مسموح به`), false);
  }
  cb(null, true);
}

/** Process image buffer → WebP, returns url + stats */
async function processImageToWebP(
  buffer: Buffer,
  originalSize: number,
  outputDir: string,
  opts: { width?: number; height?: number; quality?: number } = {},
): Promise<{
  filename: string;
  url: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
}> {
  const { width, height, quality = 85 } = opts;

  let pipeline = sharp(buffer);
  if (width || height) {
    pipeline = pipeline.resize(width, height, { fit: 'inside', withoutEnlargement: true });
  }
  pipeline = pipeline.webp({ quality, effort: 4 }).withMetadata({ exif: {} });

  const filename = secureFilename('.webp');
  const outputPath = join(outputDir, filename);
  await pipeline.toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  const compressedSize = fs.statSync(outputPath).size;
  const ratio = Math.round((1 - compressedSize / originalSize) * 100);

  return {
    filename,
    url: `/public/uploads/${outputDir.includes('thumbnails') ? 'thumbnails' : outputDir.includes('avatars') ? 'avatars' : 'images'}/${filename}`,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    originalSize,
    compressedSize,
    compressionRatio: ratio,
    format: 'webp',
  };
}

// ── Controller ────────────────────────────────────────────────────────────────
@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {

  /**
   * Mock download endpoint for development.
   */
  @Public()
  @Get('mock-download')
  mockDownload(@Query('key') key: string, @Res() res: Response) {
    // Generate a dummy PDF content
    const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (Mock Book - ${key}) /Creator (Amanat) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="mock-book.pdf"',
      'Content-Length': pdfContent.length.toString(),
    });
    res.send(pdfContent);
  }

  /**
   * Upload any image → auto-converted to WebP.
   * Also generates a thumbnail (400px wide) alongside the full image.
   * Security: MIME check + extension block + magic bytes validation.
   */
  @Post('image')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: imageFileFilter,
  }))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('لم يتم إرفاق ملف');

    // Verify real content (magic bytes)
    if (!isValidImageBuffer(file.buffer)) {
      throw new BadRequestException('الملف ليس صورة حقيقية — تم رفض الرفع');
    }

    // Convert to full WebP
    const result = await processImageToWebP(file.buffer, file.size, imagesDir, { quality: 85 });

    // Also produce a thumbnail (400px wide max)
    let thumbnail: Awaited<ReturnType<typeof processImageToWebP>> | null = null;
    try {
      thumbnail = await processImageToWebP(file.buffer, file.size, thumbsDir, { width: 400, quality: 75 });
      // Fix thumbnail URL manually
      thumbnail.url = `/public/uploads/thumbnails/${thumbnail.filename}`;
    } catch {
      // thumbnail is optional — don't fail the whole upload
    }

    return {
      url: result.url,
      thumbnailUrl: thumbnail?.url ?? null,
      width: result.width,
      height: result.height,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      format: 'webp',
      message: `تم تحويل الصورة إلى WebP وضغطها بنسبة ${result.compressionRatio}%`,
    };
  }

  /**
   * Upload avatar image → WebP, max 2MB, 300×300 output.
   * Available to any authenticated user.
   */
  @Post('avatar')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN, UserRole.USER)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max for avatars
    fileFilter: imageFileFilter,
  }))
  async uploadAvatar(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('لم يتم إرفاق ملف');

    if (!isValidImageBuffer(file.buffer)) {
      throw new BadRequestException('الملف ليس صورة حقيقية');
    }

    const filename = secureFilename('.webp');
    const outputPath = join(avatarsDir, filename);

    await sharp(file.buffer)
      .resize(300, 300, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .withMetadata({ exif: {} })
      .toFile(outputPath);

    const compressedSize = fs.statSync(outputPath).size;
    const compressionRatio = Math.round((1 - compressedSize / file.size) * 100);

    return {
      url: `/public/uploads/avatars/${filename}`,
      width: 300,
      height: 300,
      originalSize: file.size,
      compressedSize,
      compressionRatio,
      format: 'webp',
      message: `تم رفع الصورة الشخصية بنجاح وتحويلها إلى WebP`,
    };
  }

  /**
   * Upload logo/favicon/og image.
   * Same as /image but max 1MB and returned with /public/uploads/images/ prefix.
   */
  @Post('logo')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB max for logos
    fileFilter: imageFileFilter,
  }))
  async uploadLogo(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('لم يتم إرفاق ملف');

    if (!isValidImageBuffer(file.buffer)) {
      throw new BadRequestException('الملف ليس صورة حقيقية');
    }

    const result = await processImageToWebP(file.buffer, file.size, imagesDir, { quality: 90 });
    result.url = `/public/uploads/images/${result.filename}`;

    return {
      url: result.url,
      width: result.width,
      height: result.height,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      format: 'webp',
      message: `تم رفع الصورة بنجاح وتحويلها إلى WebP`,
    };
  }

  /** Upload PDF — security hardened */
  @Post('pdf')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (_req: any, file: any, cb: any) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('يُسمح بملفات PDF فقط'), false);
      }
      const ext = extname(file.originalname).toLowerCase();
      if (ext !== '.pdf') {
        return cb(new BadRequestException('الامتداد يجب أن يكون .pdf'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPdf(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('لم يتم إرفاق ملف');

    // Verify PDF magic bytes
    if (!isValidPdfBuffer(file.buffer)) {
      throw new BadRequestException('الملف ليس PDF حقيقياً');
    }

    const filename = secureFilename('.pdf');
    const outputPath = join(booksDir, filename);
    fs.writeFileSync(outputPath, file.buffer);

    return {
      url: `/public/uploads/books/${filename}`,
      size: file.size,
      filename,
      message: 'تم رفع ملف PDF بنجاح',
    };
  }
}
