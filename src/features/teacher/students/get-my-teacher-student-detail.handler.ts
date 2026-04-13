import { ForbiddenException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Role, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyTeacherStudentDetailQuery } from "./get-my-teacher-student-detail.query";

@QueryHandler(GetMyTeacherStudentDetailQuery)
export class GetMyTeacherStudentDetailHandler
  implements IQueryHandler<GetMyTeacherStudentDetailQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTeacherStudentDetailQuery) {
    const student = await this.prisma.user.findFirst({
      where: {
        id: query.studentId,
        role: Role.STUDENT,
        courseTransactions: {
          some: {
            status: TransactionStatus.SUCCESS,
            course: {
              instructorId: query.teacherId,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        is_verified: true,
        created_at: true,
        updated_at: true,
        profile: {
          select: {
            full_name: true,
            phone: true,
            avatar: true,
            bio: true,
          },
        },
        courseTransactions: {
          where: {
            status: TransactionStatus.SUCCESS,
            course: {
              instructorId: query.teacherId,
            },
          },
          select: {
            id: true,
            amount: true,
            instructorRevenue: true,
            paymentMethod: true,
            transactionRef: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
                thumbnailUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!student) {
      throw new ForbiddenException(
        "Học viên này chưa tham gia khóa học nào của bạn.",
      );
    }

    const totalSpent = student.courseTransactions.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    return {
      id: student.id,
      email: student.email,
      isVerified: student.is_verified,
      createdAt: student.created_at,
      updatedAt: student.updated_at,
      profile: student.profile
        ? {
            fullName: student.profile.full_name,
            phone: student.profile.phone,
            avatar: student.profile.avatar,
            bio: student.profile.bio,
          }
        : null,
      metrics: {
        purchasedCoursesCount: student.courseTransactions.length,
        totalSpent,
      },
      purchaseHistory: student.courseTransactions.map((item) => ({
        id: item.id,
        amount: item.amount,
        instructorRevenue: item.instructorRevenue,
        paymentMethod: item.paymentMethod,
        transactionRef: item.transactionRef,
        purchasedAt: item.createdAt,
        course: item.course,
      })),
    };
  }
}
