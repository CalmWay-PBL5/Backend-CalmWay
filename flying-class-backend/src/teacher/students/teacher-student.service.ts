import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class TeacherStudentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả học sinh đang tham gia ít nhất 1 lớp của giáo viên
   * Tối ưu: Dùng findMany với include để tránh N+1 query
   */
  async getAllStudents(
    teacherId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    try {
      // Bước 1: Lấy danh sách tất cả học sinh có enrollment trong các lớp của giáo viên
      // Dùng groupBy hoặc findMany để lấy unique users
      const students = await this.prisma.user.findMany({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          // Điều kiện: Học sinh này phải có ít nhất 1 enrollment trong lớp của giáo viên này
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          isVerified: true,
          createdAt: true,
          profile: {
            select: {
              fullName: true,
              avatar: true,
              phone: true,
              bio: true,
            },
          },
          // Chỉ lấy enrollments của các lớp thuộc sở hữu của giáo viên này
          enrollments: {
            where: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
            select: {
              id: true,
              classId: true,
              status: true,
              joinedAt: true,
              class: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                },
              },
            },
          },
        },
        skip: skip,
        take: take,
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Bước 2: Đếm tổng số học sinh (không skip/take)
      const total = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
        },
      });

      return {
        data: students.map((student) => ({
          id: student.id,
          email: student.email,
          isVerified: student.isVerified,
          createdAt: student.createdAt,
          profile: student.profile,
          enrollmentsCount: student.enrollments.length,
          enrollments: student.enrollments,
        })),
        total,
        skip,
        take,
      };
    } catch (error: any) {
      throw new BadRequestException(
        'Lỗi khi lấy danh sách học sinh: ' + error.message,
      );
    }
  }

  /**
   * Lấy chi tiết 1 học sinh và lịch sử học tập của học sinh trong các lớp của giáo viên
   * Bảo mật: Kiểm tra xem studentId có thực sự học lớp nào của teacherId không
   */
  async getStudentDetail(teacherId: string, studentId: string) {
    try {
      // Bước 1: Lấy thông tin chi tiết học sinh với các enrollment trong lớp của giáo viên
      const student = await this.prisma.user.findFirst({
        where: {
          id: studentId,
          role: 'STUDENT',
          status: 'ACTIVE',
          // Bảo mật: Kiểm tra học sinh có enrollment trong lớp của giáo viên không
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
        },
        include: {
          profile: true,
          // Lấy enrollments chỉ trong các lớp của giáo viên này
          enrollments: {
            where: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
            include: {
              class: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                  coverImage: true,
                  classCode: true,
                  maxStudents: true,
                  createdAt: true,
                },
              },
            },
            orderBy: {
              joinedAt: 'desc',
            },
          },
          // Lấy submissions của học sinh trong các lớp của giáo viên
          submissions: {
            where: {
              exam: {
                class: {
                  teacherId: teacherId,
                },
              },
            },
            include: {
              exam: {
                select: {
                  id: true,
                  title: true,
                  classId: true,
                },
              },
            },
          },
          // Lấy reviews của học sinh cho các lớp của giáo viên
          reviews: {
            where: {
              class: {
                teacherId: teacherId,
              },
            },
            include: {
              class: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

      // Bước 2: Nếu không tìm thấy, trả về ForbiddenException
      if (!student) {
        throw new ForbiddenException(
          'Học sinh này không tham gia lớp nào của bạn',
        );
      }

      // Bước 3: Format kết quả trả về
      return {
        id: student.id,
        email: student.email,
        isVerified: student.isVerified,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        profile: student.profile,
        enrollments: student.enrollments.map((enrollment) => ({
          id: enrollment.id,
          classId: enrollment.classId,
          status: enrollment.status,
          joinedAt: enrollment.joinedAt,
          class: enrollment.class,
        })),
        submissions: student.submissions.map((submission) => ({
          id: submission.id,
          score: submission.score,
          submittedAt: submission.submittedAt,
          exam: submission.exam,
        })),
        reviews: student.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          content: review.content,
          createdAt: review.createdAt,
          class: review.class,
        })),
      };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(
        'Lỗi khi lấy chi tiết học sinh: ' + error.message,
      );
    }
  }

  /**
   * Tìm kiếm học sinh trong danh sách học sinh của giáo viên
   */
  async searchStudents(
    teacherId: string,
    query: string,
    skip: number = 0,
    take: number = 20,
  ) {
    try {
      const students = await this.prisma.user.findMany({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
          OR: [
            {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              profile: {
                fullName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
            {
              profile: {
                phone: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
        select: {
          id: true,
          email: true,
          isVerified: true,
          createdAt: true,
          profile: {
            select: {
              fullName: true,
              avatar: true,
              phone: true,
            },
          },
          enrollments: {
            where: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
            select: {
              classId: true,
              class: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        skip: skip,
        take: take,
      });

      const total = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
          OR: [
            {
              email: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              profile: {
                fullName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
            {
              profile: {
                phone: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
      });

      return {
        data: students.map((student) => ({
          id: student.id,
          email: student.email,
          isVerified: student.isVerified,
          createdAt: student.createdAt,
          profile: student.profile,
          enrollmentsCount: student.enrollments.length,
          enrollments: student.enrollments,
        })),
        total,
        skip,
        take,
      };
    } catch (error: any) {
      throw new BadRequestException(
        'Lỗi khi tìm kiếm học sinh: ' + error.message,
      );
    }
  }

  /**
   * Lấy thống kê học sinh của giáo viên
   */
  async getStudentStats(teacherId: string) {
    try {
      // Tổng số học sinh
      const totalStudents = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
        },
      });

      // Số enrollment hoạt động
      const totalEnrollments = await this.prisma.enrollment.count({
        where: {
          class: {
            teacherId: teacherId,
            status: 'active',
          },
        },
      });

      // Học sinh có bài nộp
      const studentWithSubmissions = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          submissions: {
            some: {
              exam: {
                class: {
                  teacherId: teacherId,
                },
              },
            },
          },
        },
      });

      // Học sinh có đánh giá
      const studentWithReviews = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          reviews: {
            some: {
              class: {
                teacherId: teacherId,
              },
            },
          },
        },
      });

      return {
        totalStudents,
        totalEnrollments,
        studentWithSubmissions,
        studentWithReviews,
      };
    } catch (error: any) {
      throw new BadRequestException(
        'Lỗi khi lấy thống kê học sinh: ' + error.message,
      );
    }
  }


}
