import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Prisma } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ListFinanceTransactionsQuery } from "./list-transactions.query";

@QueryHandler(ListFinanceTransactionsQuery)
export class ListFinanceTransactionsHandler
  implements IQueryHandler<ListFinanceTransactionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListFinanceTransactionsQuery) {
    const { q, status, page, limit, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CourseTransactionWhereInput = {
      ...(status ? { status } : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { id: { contains: q, mode: "insensitive" } },
              { transactionRef: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.courseTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructor: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: {
                      full_name: true,
                    },
                  },
                },
              },
            },
          },
          student: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  full_name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.courseTransaction.count({ where }),
    ]);

    return {
      items: items.map((tx) => ({
        id: tx.id,
        transactionRef: tx.transactionRef,
        amount: tx.amount,
        platformFee: tx.platformFee,
        instructorRevenue: tx.instructorRevenue,
        status: tx.status,
        paymentMethod: tx.paymentMethod,
        createdAt: tx.createdAt,
        course: {
          id: tx.course.id,
          title: tx.course.title,
        },
        teacher: {
          id: tx.course.instructor.id,
          email: tx.course.instructor.email,
          fullName: tx.course.instructor.profile?.full_name || null,
        },
        student: {
          id: tx.student.id,
          email: tx.student.email,
          fullName: tx.student.profile?.full_name || null,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
