import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Role, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyTeacherStudentStatsQuery } from "./get-my-teacher-student-stats.query";

@QueryHandler(GetMyTeacherStudentStatsQuery)
export class GetMyTeacherStudentStatsHandler
  implements IQueryHandler<GetMyTeacherStudentStatsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTeacherStudentStatsQuery) {
    const transactionWhere = {
      status: TransactionStatus.SUCCESS,
      course: {
        instructorId: query.teacherId,
      },
    };

    const studentWhere = {
      role: Role.STUDENT,
      courseTransactions: {
        some: transactionWhere,
      },
    };

    const [totalStudents, totalOrders, totalRevenueAgg, studentCoursePairs] =
      await Promise.all([
        this.prisma.user.count({ where: studentWhere }),
        this.prisma.courseTransaction.count({ where: transactionWhere }),
        this.prisma.courseTransaction.aggregate({
          where: transactionWhere,
          _sum: {
            instructorRevenue: true,
          },
        }),
        this.prisma.courseTransaction.findMany({
          where: transactionWhere,
          select: {
            studentId: true,
            courseId: true,
          },
          distinct: ["studentId", "courseId"],
        }),
      ]);

    const uniqueCourseCountByStudent = new Map<string, number>();
    for (const pair of studentCoursePairs) {
      uniqueCourseCountByStudent.set(
        pair.studentId,
        (uniqueCourseCountByStudent.get(pair.studentId) || 0) + 1,
      );
    }

    const repeatStudents = Array.from(uniqueCourseCountByStudent.values()).filter(
      (count) => count >= 2,
    ).length;

    return {
      totalStudents,
      totalOrders,
      totalRevenue: totalRevenueAgg._sum.instructorRevenue || 0,
      repeatStudents,
    };
  }
}
