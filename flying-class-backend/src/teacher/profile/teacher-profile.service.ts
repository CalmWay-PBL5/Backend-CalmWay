import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service'; // Điều chỉnh đường dẫn này nếu file prisma.service.ts của bạn nằm chỗ khác
import { UpdateTeacherProfileDto } from './update-teacher-profile.dto';

@Injectable()
export class TeacherProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        profile: true, // Lấy toàn bộ thông tin bảng profile
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin giáo viên');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateTeacherProfileDto) {
    // Dùng upsert: Cập nhật nếu đã có, tạo mới nếu chưa có
    const updatedProfile = await this.prisma.profile.upsert({
      where: { userId: userId },
      update: {
        fullName: data.fullName,
        phone: data.phone,
        avatar: data.avatar,
        bio: data.bio,
        identifyCardUrl: data.identifyCardUrl,
        degreeUrls: data.degreeUrls,
        experienceYears: data.experienceYears,
      },
      create: {
        userId: userId,
        fullName: data.fullName,
        phone: data.phone,
        avatar: data.avatar,
        bio: data.bio,
        identifyCardUrl: data.identifyCardUrl,
        degreeUrls: data.degreeUrls || [],
        experienceYears: data.experienceYears,
      },
    });

    return updatedProfile;
  }
}
