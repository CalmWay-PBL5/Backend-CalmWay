import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import type { Express } from 'express';
import { TeacherProfileService } from './teacher-profile.service';
import { UpdateTeacherProfileDto } from './update-teacher-profile.dto';

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
    // Chỉ chấp nhận ảnh (PNG, JPG, JPEG, GIF) và PDF
    const allowedMimes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'application/pdf',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          `Loại file không được hỗ trợ: ${file.mimetype}. Chỉ chấp nhận: PNG, JPG, JPEG, GIF, PDF`,
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
};

// ============================================
// CONTROLLER
// ============================================
@Controller('teachers/me/profile')
export class TeacherProfileController {
  constructor(private readonly profileService: TeacherProfileService) {}

  @Get()
  async getMyProfile(@Req() req: any) {
    console.log('🔥 GET /api/v1/teachers/me/profile called!');

    // TODO: Thay bằng real user ID từ JWT token
    // const userId = req.user.id;
    const userId = 'e350d7e6-ba21-4abf-ba8e-a36263f2434b'; // Teacher test user

    const data = await this.profileService.getProfile(userId);
    return {
      status: 'success',
      data: data,
    };
  }

  @Put()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'identifyCardUrl', maxCount: 1 },
        { name: 'degrees', maxCount: 5 },
      ],
      multerOptions,
    ),
  )
  async updateProfile(
    @Req() req: any,
    @Body() updateDto: UpdateTeacherProfileDto,
    @UploadedFiles() files: any,
  ) {
    console.log('🔥 PUT /api/v1/teachers/me/profile called!');
    console.log('📦 Uploaded files:', files);

    const userId = 'e350d7e6-ba21-4abf-ba8e-a36263f2434b'; // Teacher test user

    // ==========================================
    // XỬ LÝ FILE UPLOAD
    // ==========================================

    // Nếu có upload avatar, tạo link và gán vào DTO
    if (files?.avatar?.[0]) {
      const avatarFile = files.avatar[0];
      updateDto.avatar = `http://localhost:3000/uploads/${avatarFile.filename}`;
      console.log('✅ Avatar link:', updateDto.avatar);
    }

    // Nếu có upload identifyCardUrl, tạo link và gán vào DTO
    if (files?.identifyCardUrl?.[0]) {
      const idCardFile = files.identifyCardUrl[0];
      updateDto.identifyCardUrl = `http://localhost:3000/uploads/${idCardFile.filename}`;
      console.log('✅ Identity card link:', updateDto.identifyCardUrl);
    }

    // Nếu có upload degrees (bằng cấp), map thành mảng URL
    if (files?.degrees && files.degrees.length > 0) {
      updateDto.degreeUrls = files.degrees.map(
        (file: Express.Multer.File) => `http://localhost:3000/uploads/${file.filename}`,
      );
      console.log('✅ Degree URLs:', updateDto.degreeUrls);
    }

    // Ép kiểu experienceYears thành Number (vì form-data gửi dưới dạng string)
    if (updateDto.experienceYears) {
      updateDto.experienceYears = Number(updateDto.experienceYears);
    }

    // Gọi service để cập nhật profile
    const updated = await this.profileService.updateProfile(
      userId,
      updateDto,
    );

    return {
      status: 'success',
      message: 'Cập nhật hồ sơ giáo viên thành công',
      data: updated,
    };
  }
}