import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { CreateCloudDocDto } from './dto/create-cloud-doc.dto';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🛠️ Logic phân loại và xử lý URL theo phong cách Teams
   */
  private processDriveUrl(rawUrl: string) {
    let embedUrl = rawUrl;
    let displayMode = 'EMBED'; // EMBED hoặc REDIRECT
    let fileType = 'EXTERNAL';

    try {
      // 1. Google Docs, Sheets, Slides
      if (rawUrl.includes('docs.google.com')) {
        fileType = 'GOOGLE_OFFICE';
        embedUrl = rawUrl.replace(/\/(edit|view|present|copy|share).*$/, '/preview');
      } 
      
      // 2. Google Drive File (PDF, Video, Image)
      else if (rawUrl.includes('drive.google.com/file/d/')) {
        fileType = 'DRIVE_FILE';
        const fileId = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
        if (fileId) {
          embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }

      // 3. Google Drive Folder
      else if (rawUrl.includes('drive.google.com/drive/folders/')) {
        fileType = 'DRIVE_FOLDER';
        displayMode = 'REDIRECT'; // Folder nên mở tab mới vì nhúng rất xấu và hay lỗi
      }

      // 4. YouTube
      else if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
        fileType = 'YOUTUBE';
        const videoId = rawUrl.includes('v=') 
          ? new URL(rawUrl).searchParams.get('v') 
          : rawUrl.split('/').pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (error) {
      displayMode = 'REDIRECT';
    }

    return { embedUrl, displayMode, fileType };
  }

  // Tạo tài liệu mới
  async createCloudDocument(dto: CreateCloudDocDto) {
    const { embedUrl, displayMode, fileType } = this.processDriveUrl(dto.url);
    
    return this.prisma.lesson.create({
      data: {
        classId: dto.classId,
        title: dto.title,
        contentType: 'CLOUD_DOC',
        url: embedUrl,
        // Lưu Metadata vào bodyText để Frontend xử lý icon và cách mở
        bodyText: JSON.stringify({
          displayMode,
          fileType,
          originalUrl: dto.url
        }),
        orderIndex: 0,
      },
    });
  }

  // Lấy danh sách tài liệu của lớp
  async getCloudDocumentsByClass(classId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        classId: classId,
        contentType: 'CLOUD_DOC',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse ngược lại Metadata từ string sang object cho Frontend dễ dùng
    return lessons.map(lesson => ({
      ...lesson,
      metadata: lesson.bodyText ? JSON.parse(lesson.bodyText) : null
    }));
  }

  // Cập nhật tiêu đề
  async updateTitle(id: string, newTitle: string) {
    const doc = await this.prisma.lesson.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Tài liệu không tồn tại!');

    return this.prisma.lesson.update({
      where: { id },
      data: { title: newTitle },
    });
  }

  // Xóa tài liệu
  async delete(id: string) {
    const doc = await this.prisma.lesson.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Tài liệu không tồn tại!');

    return this.prisma.lesson.delete({ where: { id } });
  }
}