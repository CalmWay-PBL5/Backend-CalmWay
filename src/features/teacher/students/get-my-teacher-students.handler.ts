import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Role, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyTeacherStudentsQuery } from "./get-my-teacher-students.query";

@QueryHandler(GetMyTeacherStudentsQuery)
export class GetMyTeacherStudentsHandler
  implements IQueryHandler<GetMyTeacherStudentsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTeacherStudentsQuery) {
    const where = {
      role: Role.STUDENT,
      courseTransactions: {
        some: {
          status: TransactionStatus.SUCCESS,
          course: {
            instructorId: query.teacherId,
          },
        },
      },
    };

    const [total, students] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          email: true,
          is_verified: true,
          created_at: true,
          profile: {
            select: {
              full_name: true,
              phone: true,
              avatar: true,
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
              amount: true,
              instructorRevenue: true,
              courseId: true,
              createdAt: true,
              course: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
    ]);

    return {
      data: students.map((student) => {
        const totalSpent = student.courseTransactions.reduce(
          (sum, item) => sum + item.amount,
          0,
        );

        return {
          id: student.id,
          email: student.email,
          isVerified: student.is_verified,
          createdAt: student.created_at,
          profile: student.profile
            ? {
                fullName: student.profile.full_name,
                phone: student.profile.phone,
                avatar: student.profile.avatar,
              }
            : null,
          purchasedCoursesCount: student.courseTransactions.length,
          totalSpent,
          purchasedCourses: student.courseTransactions.map((tx) => ({
            courseId: tx.courseId,
            courseTitle: tx.course.title,
            paidAmount: tx.amount,
            instructorRevenue: tx.instructorRevenue,
            purchasedAt: tx.createdAt,
          })),
        };
      }),
      total,
      skip: query.skip,
      take: query.take,
    };
  }
}
