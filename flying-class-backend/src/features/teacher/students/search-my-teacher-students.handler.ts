import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Role, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { SearchMyTeacherStudentsQuery } from "./search-my-teacher-students.query";

@QueryHandler(SearchMyTeacherStudentsQuery)
export class SearchMyTeacherStudentsHandler
  implements IQueryHandler<SearchMyTeacherStudentsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchMyTeacherStudentsQuery) {
    const keyword = query.keyword.trim();

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
      OR: [
        {
          email: {
            contains: keyword,
            mode: "insensitive" as const,
          },
        },
        {
          profile: {
            is: {
              full_name: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
          },
        },
        {
          profile: {
            is: {
              phone: {
                contains: keyword,
                mode: "insensitive" as const,
              },
            },
          },
        },
      ],
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
              courseId: true,
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: students.map((student) => ({
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
        purchasedCourses: student.courseTransactions.map((item) => ({
          courseId: item.courseId,
          courseTitle: item.course.title,
        })),
      })),
      total,
      skip: query.skip,
      take: query.take,
    };
  }
}
