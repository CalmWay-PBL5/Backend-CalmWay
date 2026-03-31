import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service'; 

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}
// 🔥 THÊM MỚI: Lấy danh sách chi tiết các đánh giá của giáo viên
  async getDetailedReviews(teacherId: string) {
    return this.prisma.review.findMany({
      where: {
        class: {
          teacherId: teacherId, // Chỉ lấy đánh giá thuộc các lớp của thầy cô này
        },
      },
      include: {
        // Lấy kèm thông tin lớp học để biết đánh giá này dành cho lớp nào
        class: {
          select: {
            id: true,
            title: true,
          },
        },
        // Lấy kèm thông tin học sinh đã đánh giá
        student: {
          select: {
            id: true,
            email: true,
            // Nếu bảng User của bạn có fullName hay avatar thì thêm vào đây:
            // profile: { select: { fullName: true, avatar: true } }
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Đánh giá mới nhất xếp lên đầu
    });
  }
  async create(teacherId: string, data: CreateClassDto) {
    const randomString = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const classCode = `CLASS-${randomString}`;

    try {
      const newClass = await this.prisma.class.create({
        data: {
          teacherId: teacherId,
          title: data.title,
          description: data.description,
          price: data.price,
          coverImage: data.coverImage,
          type: data.type || 'PUBLIC',
          classCode: classCode, 
        },
      });
      return newClass;
    } catch (error: any) {
      throw new BadRequestException('Lỗi khi lưu lớp học vào hệ thống: ' + error.message);
    }
  }

  async findAll(teacherId: string) {
    // Tìm tất cả các lớp của giáo viên này, nhưng CHỈ lấy lớp đang ACTIVE
    return this.prisma.class.findMany({
      where: {
        teacherId: teacherId,
        status: 'active', // Bỏ qua những lớp đã bị xóa mềm
      },
      orderBy: { createdAt: 'desc' }, // Lớp mới tạo xếp lên đầu
    });
  }

  async findOne(id: string, teacherId: string) {
    const classItem = await this.prisma.class.findFirst({
      where: { 
        id: id, 
        teacherId: teacherId, 
        status: 'active' 
      },
    });

    if (!classItem) {
      throw new NotFoundException('Không tìm thấy lớp học hoặc lớp đã bị xóa');
    }
    return classItem;
  }

  async update(id: string, teacherId: string, updateClassDto: UpdateClassDto) {
    await this.findOne(id, teacherId); 

    return this.prisma.class.update({
      where: { id: id },
      data: updateClassDto,
    });
  }

  async remove(id: string, teacherId: string) {
    await this.findOne(id, teacherId); // Đảm bảo lớp này tồn tại và thuộc về giáo viên này

    return this.prisma.class.update({
      where: { id: id },
      data: {
        status: 'deleted', // <-- Đánh dấu là đã vào thùng rác
        deletedAt: new Date(), // <-- Lưu lại thời điểm bắt đầu vào thùng rác
      },
    });
  }

  // 🔥 THÊM MỚI: Lấy danh sách lớp học ĐANG TRONG THÙNG RÁC
  async findTrash(teacherId: string) {
    return this.prisma.class.findMany({
      where: {
        teacherId: teacherId,
        status: 'deleted', // Chỉ lấy những lớp đã bị xóa mềm
      },
      orderBy: { deletedAt: 'desc' }, // Lớp mới xóa xếp lên đầu
    });
  }

  // 🔥 THÊM MỚI: Khôi phục lớp học từ thùng rác
  async restore(id: string, teacherId: string) {
    // 1. Kiểm tra xem lớp này có đúng là đang trong thùng rác không
    const classItem = await this.prisma.class.findFirst({
      where: { 
        id: id, 
        teacherId: teacherId, 
        status: 'deleted' 
      },
    });

    if (!classItem) {
      throw new NotFoundException('Không tìm thấy lớp học trong thùng rác');
    }

    // 2. Cập nhật lại trạng thái thành active và xóa thời gian deletedAt
    return this.prisma.class.update({
      where: { id: id },
      data: {
        status: 'active',
        deletedAt: null, // Hủy bỏ đánh dấu thời gian xóa
      },
    });
  }

  // 🔥 THÊM MỚI: Lấy thống kê Dashboard cho Giáo viên (cập nhật với dữ liệu thực)
  async getTeacherDashboardStats(teacherId: string) {
    // Chạy 4 query song song để tối ưu hiệu năng
    const [
      classCount,
      studentCount,
      classesWithDetails,
      reviewsData,
    ] = await Promise.all([
      // Query 1: Đếm số lớp ACTIVE
      this.prisma.class.count({
        where: {
          teacherId: teacherId,
          status: 'active',
        },
      }),
      
      // Query 2: Đếm số học sinh ACTIVE
      this.prisma.enrollment.count({
        where: {
          class: {
            teacherId: teacherId,
            status: 'active',
          },
          status: 'ACTIVE',
        },
      }),
      
      // Query 3: Lấy chi tiết lớp kèm số lượng enrollment ACTIVE để tính doanh thu
      this.prisma.class.findMany({
        where: {
          teacherId: teacherId,
          status: 'active',
        },
        include: {
          enrollments: {
            where: { status: 'ACTIVE' },
            select: { id: true },
          },
        },
      }),

      // Query 4: Lấy tất cả reviews của các lớp của teacher này (để tính trung bình)
      this.prisma.review.findMany({
        where: {
          class: {
            teacherId: teacherId,
            status: 'active',
          },
        },
        select: {
          rating: true,
        },
      }),
    ]);

    // Tính toán các chỉ số
    const totalClasses = classCount;
    const totalStudents = studentCount;

    // ==========================================
    // Tính Doanh thu: Giá × Số học sinh ACTIVE
    // ==========================================
    // Công thức: Doanh thu = Tổng của (Giá mỗi lớp × Số lượng học viên ACTIVE của lớp đó)
    const totalRevenue = classesWithDetails.reduce((acc: number, classItem: any) => {
      const classPrice = Number(classItem.price); // Ép kiểu Decimal → Number
      const activeStudentCount = classItem.enrollments.length;
      return acc + (classPrice * activeStudentCount);
    }, 0);

    // ==========================================
    // Tính Đánh giá trung bình
    // ==========================================
    // Nếu chưa có review (null), mặc định là 5.0
    let averageRating = 5.0;
    if (reviewsData && reviewsData.length > 0) {
      const sumRating = reviewsData.reduce((acc: number, review: any) => acc + review.rating, 0);
      averageRating = parseFloat((sumRating / reviewsData.length).toFixed(1));
    }

    // ==========================================
    // Tìm lớp đông nhất (Popular Class)
    // ==========================================
    let popularClass = null;
    if (classesWithDetails.length > 0) {
      const classSortedByEnrollment = [...classesWithDetails].sort(
        (a: any, b: any) => b.enrollments.length - a.enrollments.length
      );
      const mostPopular = classSortedByEnrollment[0];
      popularClass = {
        id: mostPopular.id,
        title: mostPopular.title,
        studentCount: mostPopular.enrollments.length,
      };
    }

    return {
      totalClasses,
      totalStudents,
      totalRevenue: Number(totalRevenue.toFixed(2)), // Ép kiểu → Number, fixed 2 decimal
      averageRating,
      popularClass,
    };
  }

  // 🔥 Tác vụ chạy ngầm lúc 00:00 mỗi ngày để dọn rác
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronDeleteTrash() {
    console.log('🧹 Bắt đầu quét và dọn dẹp thùng rác...');

    // Tính toán mốc thời gian: 30 ngày trước so với hiện tại
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      // Hard Delete: Xóa vĩnh viễn khỏi Database những lớp đã ở trong thùng rác quá 30 ngày
      const result = await this.prisma.class.deleteMany({
        where: {
          status: 'deleted', 
          deletedAt: {
            lte: thirtyDaysAgo, 
          },
        },
      });

      if (result.count > 0) {
        console.log(`✅ Đã xóa vĩnh viễn ${result.count} lớp học quá hạn 30 ngày.`);
      }
    } catch (error) {
      console.error('❌ Lỗi khi dọn dẹp thùng rác:', error);
    }
  }
}