import { BadRequestException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ExportMyClassMembersQuery } from "./export-my-class-members.query";
import { toCsv } from "./class-export.util";

@QueryHandler(ExportMyClassMembersQuery)
export class ExportMyClassMembersHandler
  implements IQueryHandler<ExportMyClassMembersQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ExportMyClassMembersQuery) {
    const classItem = await this.prisma.class.findFirst({
      where: {
        id: query.classId,
        teacher_id: query.teacherId,
        status: ClassStatus.ACTIVE,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!classItem) {
      throw new BadRequestException(
        "Lớp học không tồn tại hoặc không thuộc về bạn.",
      );
    }

    const members = await this.prisma.classMember.findMany({
      where: {
        class_id: query.classId,
        status: ClassMemberStatus.ACTIVE,
      },
      orderBy: {
        joined_at: "asc",
      },
      select: {
        joined_at: true,
        student: {
          select: {
            email: true,
            profile: {
              select: {
                full_name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    const fallbackMembers =
      members.length > 0
        ? []
        : await this.prisma.transaction.findMany({
            where: {
              class_id: query.classId,
              status: TransactionStatus.SUCCESS,
            },
            distinct: ["user_id"],
            orderBy: {
              created_at: "asc",
            },
            select: {
              created_at: true,
              user: {
                select: {
                  email: true,
                  profile: {
                    select: {
                      full_name: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          });

    const rows: Array<Array<string | number>> = [
      ["STT", "Ho va ten", "Email", "So dien thoai", "Ngay tham gia"],
    ];

    if (members.length) {
      members.forEach((member, idx) => {
        rows.push([
          idx + 1,
          member.student.profile?.full_name || "",
          member.student.email,
          member.student.profile?.phone || "",
          member.joined_at.toISOString(),
        ]);
      });
    } else {
      fallbackMembers.forEach((member, idx) => {
        rows.push([
          idx + 1,
          member.user.profile?.full_name || "",
          member.user.email,
          member.user.profile?.phone || "",
          member.created_at.toISOString(),
        ]);
      });
    }

    return {
      fileName: `class-${classItem.id}-members-${Date.now()}.csv`,
      csv: toCsv(rows),
    };
  }
}
