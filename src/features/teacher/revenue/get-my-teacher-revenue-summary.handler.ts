import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CourseStatus, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyTeacherRevenueSummaryQuery } from "./get-my-teacher-revenue-summary.query";

type CourseRevenueItem = {
  courseId: string;
  courseTitle: string;
  revenue: number;
  studentIds: Set<string>;
};

@QueryHandler(GetMyTeacherRevenueSummaryQuery)
export class GetMyTeacherRevenueSummaryHandler
  implements IQueryHandler<GetMyTeacherRevenueSummaryQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyTeacherRevenueSummaryQuery) {
    const where = {
      status: TransactionStatus.SUCCESS,
      course: {
        instructorId: query.teacherId,
      },
    };

    const [transactions, totalCourses] = await Promise.all([
      this.prisma.courseTransaction.findMany({
        where,
        select: {
          studentId: true,
          courseId: true,
          instructorRevenue: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
      this.prisma.course.count({
        where: {
          instructorId: query.teacherId,
          status: CourseStatus.APPROVED,
        },
      }),
    ]);

    let totalRevenue = 0;
    const totalStudentsSet = new Set<string>();
    const byCourse = new Map<string, CourseRevenueItem>();

    for (const transaction of transactions) {
      totalRevenue += transaction.instructorRevenue;
      totalStudentsSet.add(transaction.studentId);

      const existing = byCourse.get(transaction.courseId);
      if (!existing) {
        byCourse.set(transaction.courseId, {
          courseId: transaction.courseId,
          courseTitle: transaction.course.title,
          revenue: transaction.instructorRevenue,
          studentIds: new Set([transaction.studentId]),
        });
        continue;
      }

      existing.revenue += transaction.instructorRevenue;
      existing.studentIds.add(transaction.studentId);
    }

    const revenueByCourse = Array.from(byCourse.values())
      .map((item) => ({
        courseId: item.courseId,
        courseTitle: item.courseTitle,
        studentCount: item.studentIds.size,
        revenue: item.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalCourses,
      totalStudents: totalStudentsSet.size,
      totalOrders: transactions.length,
      revenueByCourse,
    };
  }
}
