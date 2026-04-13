import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ListMyClassDetailedReviewsQuery } from "./list-my-class-detailed-reviews.query";

@QueryHandler(ListMyClassDetailedReviewsQuery)
export class ListMyClassDetailedReviewsHandler
  implements IQueryHandler<ListMyClassDetailedReviewsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMyClassDetailedReviewsQuery) {
    const reviews = await this.prisma.classReview.findMany({
      where: {
        class: {
          teacher_id: query.teacherId,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            title: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                full_name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.created_at,
      class: review.class,
      student: {
        id: review.student.id,
        email: review.student.email,
        fullName: review.student.profile?.full_name || null,
        avatar: review.student.profile?.avatar || null,
      },
    }));
  }
}
