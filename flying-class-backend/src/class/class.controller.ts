import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import type { Express } from 'express';
import { } from 'multer';
import { Response } from 'express';
import { ClassService } from './class.service';
import { ClassExportService } from './class-export.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const multer = require('multer');
const { diskStorage } = multer;

// ============================================
// MULTER CONFIGURATION
// ============================================
const multerOptions = {
  storage: diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, './uploads');
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      // Tự động đổi tên file: timestamp + random + extension
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExt = path.extname(file.originalname);
      const fileName = path.basename(
        file.originalname,
        fileExt,
      );
      cb(null, `${fileName}-${uniqueSuffix}${fileExt}`);
    },
  }),
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
    // Chỉ chấp nhận ảnh (PNG, JPG, JPEG, GIF)
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Loại file không được hỗ trợ: ${file.mimetype}. Chỉ chấp nhận: PNG, JPG, JPEG, GIF`,
        ),
        false,
      );
    }
  },
  limits: {
  fileSize: 20 * 1024 * 1024, // Nâng lên 20MB (20 * 1MB)
  },
};

// ============================================
// CONTROLLER
// ============================================
@Controller('classes')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly exportService: ClassExportService,
  ) {}

  // Gom cái ID giả này ra ngoài để dùng chung cho tiện
  private readonly fakeTeacherId = 'e350d7e6-ba21-4abf-ba8e-a36263f2434b';

  // ==========================================
  // POST: TẠO LỚP MỚI (với upload ảnh bìa)
  // ==========================================
  // Nhớ đặt endpoint này ở TRÊN @Get(':id') nhé
  @Get('reviews/detailed')
  async getDetailedReviews() {
    const result = await this.classService.getDetailedReviews(this.fakeTeacherId);
    return { status: 'success', data: result };
  }
  @Post()
  @UseInterceptors(FileInterceptor('coverImage', multerOptions))
  async create(
    @Body() createClassDto: CreateClassDto,
    @UploadedFile() file?: Express.Multer.File | undefined,
  ) {
    console.log('🔥 POST /api/v1/classes called!');
    console.log('📦 Uploaded file:', file);

    // ==========================================
    // XỬ LÝ FILE UPLOAD
    // ==========================================

    // Nếu có upload ảnh bìa, tạo link và gán vào DTO
    if (file) {
      createClassDto.coverImage = `http://localhost:3000/uploads/${file.filename}`;
      console.log('✅ Cover image link:', createClassDto.coverImage);
    }

    // Ép kiểu price thành Number (vì form-data gửi dưới dạng string)
    createClassDto.price = Number(createClassDto.price);

    // Gọi service để tạo lớp mới
    const newClass = await this.classService.create(
      this.fakeTeacherId,
      createClassDto,
    );

    return {
      status: 'success',
      message: 'Tạo lớp học mới thành công',
      data: newClass,
    };
  }

  @Get()
  async findAll() {
    const result = await this.classService.findAll(this.fakeTeacherId);
    return { status: 'success', data: result };
  }

  // 🔥 QUAN TRỌNG: API lấy thống kê Dashboard BẮT BUỘC phải nằm trước @Get(':id')
  @Get('teacher/dashboard/stats')
  async getTeacherDashboardStats() {
    const result = await this.classService.getTeacherDashboardStats(
      this.fakeTeacherId,
    );
    return { status: 'success', data: result };
  }

  // 🔥 QUAN TRỌNG: API lấy thùng rác BẮT BUỘC phải nằm trước @Get(':id')
  @Get('trash')
  async findTrash() {
    const result = await this.classService.findTrash(this.fakeTeacherId);
    return { status: 'success', data: result };
  }

  // 🔥 QUAN TRỌNG: API xuất Excel danh sách lớp BẮT BUỘC phải nằm trước @Get(':id')
  @Get('export/all')
  async exportAllClasses(@Res() res: Response) {
    try {
      const fileName = await this.exportService.exportClassesToExcel(
        this.fakeTeacherId,
      );
      
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="danh-sach-lop.xlsx"`,
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      
      const filePath = `${process.cwd()}/uploads/${fileName}`;
      res.download(filePath, 'danh-sach-lop.xlsx', (err) => {
        if (err) {
          console.error('❌ Lỗi khi download file:', err);
        } else {
          // Xóa file sau khi download (optional)
          const fs = require('fs');
          setTimeout(() => {
            fs.unlinkSync(filePath);
          }, 5000);
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: 'Lỗi khi xuất file Excel',
        error: error.message,
      });
    }
  }

  // 🔥 QUAN TRỌNG: API xuất Excel danh sách học sinh BẮT BUỘC phải nằm trước @Get(':id')
  @Get('export/:id/members')
  async exportClassMembers(
    @Param('id') classId: string,
    @Res() res: Response,
  ) {
    try {
      const fileName = await this.exportService.exportClassMembersToExcel(
        classId,
        this.fakeTeacherId,
      );

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="danh-sach-hoc-sinh.xlsx"`,
      );
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      const filePath = `${process.cwd()}/uploads/${fileName}`;
      res.download(filePath, 'danh-sach-hoc-sinh.xlsx', (err) => {
        if (err) {
          console.error('❌ Lỗi khi download file:', err);
        } else {
          // Xóa file sau khi download (optional)
          const fs = require('fs');
          setTimeout(() => {
            fs.unlinkSync(filePath);
          }, 5000);
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: 'Lỗi khi xuất file Excel',
        error: error.message,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.classService.findOne(id, this.fakeTeacherId);
    return { status: 'success', data: result };
  }

  // ==========================================
  // PATCH: CẬP NHẬT LỚP (với upload ảnh bìa)
  // ==========================================
  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverImage', multerOptions))
  async update(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
    @UploadedFile() file?: Express.Multer.File | undefined,
  ) {
    console.log('🔥 PATCH /api/v1/classes/:id called!');
    console.log('📦 Uploaded file:', file);

    // ==========================================
    // XỬ LÝ FILE UPLOAD
    // ==========================================

    // Nếu có upload ảnh bìa, tạo link và gán vào DTO
    if (file) {
      updateClassDto.coverImage = `http://localhost:3000/uploads/${file.filename}`;
      console.log('✅ Cover image link:', updateClassDto.coverImage);
    }

    // Ép kiểu price thành Number (vì form-data gửi dưới dạng string)
    if (updateClassDto.price) {
      updateClassDto.price = Number(updateClassDto.price);
    }

    // Gọi service để cập nhật lớp
    const result = await this.classService.update(
      id,
      this.fakeTeacherId,
      updateClassDto,
    );

    return {
      status: 'success',
      message: 'Cập nhật lớp học thành công',
      data: result,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.classService.remove(id, this.fakeTeacherId);
    return {
      status: 'success',
      message: 'Đã đưa lớp học vào thùng rác (Soft Delete)',
    };
  }

  // 🔥 QUAN TRỌNG: API khôi phục lớp học
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    const result = await this.classService.restore(id, this.fakeTeacherId);
    return {
      status: 'success',
      message: 'Khôi phục lớp học thành công',
      data: result,
    };
  }

  @Put(':id')
  async replace(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    const result = await this.classService.update(
      id,
      this.fakeTeacherId,
      updateClassDto,
    );
    return {
      status: 'success',
      message: 'Thay thế lớp học thành công',
      data: result,
    };
  }
}