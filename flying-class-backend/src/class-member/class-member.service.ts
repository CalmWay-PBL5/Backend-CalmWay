import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import { CreateClassMemberDto } from './dto/create-class-member.dto';

@Injectable()
export class ClassMemberService {
  constructor(private prisma: PrismaService) {}

  // 1. Thêm học sinh vào lớp (với giới hạn sĩ số)
  async addStudent(data: CreateClassMemberDto) {
    // Check xem học sinh này đã có trong lớp chưa
    const existing = await this.prisma.enrollment.findFirst({
      where: { 
        classId: data.classId, 
        studentId: data.studentId 
      }
    });

    if (existing) {
      throw new BadRequestException('Học sinh này đã tham gia lớp học này rồi!');
    }

    // Lấy thông tin lớp học để biết maxStudents
    const classInfo = await this.prisma.class.findUnique({
      where: { id: data.classId },
      select: { maxStudents: true }
    });

    if (!classInfo) {
      throw new BadRequestException('Lớp học không tồn tại!');
    }

    // Đếm số học sinh đang ACTIVE trong lớp
    const activeStudentCount = await this.prisma.enrollment.count({
      where: {
        classId: data.classId,
        status: 'ACTIVE'
      }
    });

    // Kiểm tra xem lớp đã đạt giới hạn sĩ số chưa
    if (activeStudentCount >= classInfo.maxStudents) {
      throw new BadRequestException('Lớp học đã đạt giới hạn sĩ số tối đa, không thể thêm học viên!');
    }

    return this.prisma.enrollment.create({
      data: {
        classId: data.classId,
        studentId: data.studentId,
        status: 'ACTIVE',
      }
    });
  }

  // 2. Lấy danh sách toàn bộ học sinh của 1 lớp
  async findStudentsByClass(classId: string) {
    return this.prisma.enrollment.findMany({
      where: { classId },
      include: {
        student: true, // Lấy luôn thông tin tên, email của học sinh từ bảng User
      }
    });
  }

  // 3. Cập nhật trạng thái học sinh thành Thôi học (Soft Delete - Giữ lịch sử)
  async removeStudent(classId: string, studentId: string) {
    const member = await this.prisma.enrollment.findFirst({
      where: { classId, studentId }
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy học sinh này trong lớp học');
    }

    // Cập nhật status thành 'DROPPED' thay vì xóa cứng (bảo toàn lịch sử dữ liệu)
    await this.prisma.enrollment.updateMany({
      where: { classId, studentId },
      data: { status: 'DROPPED' }
    });

    return { 
      status: 'success', 
      message: 'Đã cập nhật trạng thái học viên thành Thôi học' 
    };
  }
}