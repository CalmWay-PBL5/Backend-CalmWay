import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { GetMyClassDashboardStatsQuery } from "./get-my-class-dashboard-stats.query";

@QueryHandler(GetMyClassDashboardStatsQuery)
export class GetMyClassDashboardStatsHandler
  implements IQueryHandler<GetMyClassDashboardStatsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyClassDashboardStatsQuery) {
    const [classes, reviewStats] = await Promise.all([
      this.prisma.class.findMany({
        where: {
          teacher_id: query.teacherId,
          status: ClassStatus.ACTIVE,
        },
        select: {
          id: true,
          title: true,
          transactions: {
            where: {
              status: TransactionStatus.SUCCESS,
            },
            select: {
              user_id: true,
              amount: true,
            },
          },
          classMembers: {
            where: {
              status: ClassMemberStatus.ACTIVE,
            },
            select: {
              student_id: true,
            },
          },
        },
      }),
      this.prisma.classReview.aggregate({
        where: {
          class: {
            teacher_id: query.teacherId,
            status: ClassStatus.ACTIVE,
          },
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const totalClasses = classes.length;
    const studentSet = new Set<string>();
    let totalRevenue = 0;

    let popularClass: {
      id: string;
      title: string;
      studentCount: number;
    } | null = null;

    for (const classItem of classes) {
      const classStudents = classItem.classMembers.length
        ? new Set<string>(classItem.classMembers.map((member) => member.student_id))
        : new Set<string>(classItem.transactions.map((item) => item.user_id));

      for (const transaction of classItem.transactions) {
        totalRevenue += Number(transaction.amount || 0);
      }

      for (const studentId of classStudents) {
        studentSet.add(studentId);
      }

      if (!popularClass || classStudents.size > popularClass.studentCount) {
        popularClass = {
          id: classItem.id,
          title: classItem.title,
          studentCount: classStudents.size,
        };
      }
    }

    const averageRating =
      reviewStats._count.id > 0 && typeof reviewStats._avg.rating === "number"
        ? Number(reviewStats._avg.rating.toFixed(1))
        : 5;

    return {
      totalClasses,
      totalStudents: studentSet.size,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      averageRating,
      popularClass,
    };
  }
}
