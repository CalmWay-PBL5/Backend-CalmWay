import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ClassMemberStatus, ClassStatus, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ExportMyClassesQuery } from "./export-my-classes.query";
import { toCsv } from "./class-export.util";

@QueryHandler(ExportMyClassesQuery)
export class ExportMyClassesHandler implements IQueryHandler<ExportMyClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ExportMyClassesQuery) {
    const classes = await this.prisma.class.findMany({
      where: {
        teacher_id: query.teacherId,
        status: ClassStatus.ACTIVE,
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
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
      orderBy: {
        created_at: "desc",
      },
    });

    const rows: Array<Array<string | number>> = [
      [
        "STT",
        "Ten lop hoc",
        "Ma lop",
        "Mon hoc",
        "Mo ta",
        "Gia tien",
        "So hoc sinh",
        "Loai lop",
        "Ngay tao",
      ],
    ];

    classes.forEach((classItem, idx) => {
      const studentCount = classItem.classMembers.length
        ? new Set(classItem.classMembers.map((item) => item.student_id)).size
        : new Set(classItem.transactions.map((item) => item.user_id)).size;
      rows.push([
        idx + 1,
        classItem.title,
        classItem.class_code,
        classItem.subject?.name || "",
        classItem.description || "",
        Number(classItem.price || 0),
        studentCount,
        classItem.type,
        classItem.created_at.toISOString(),
      ]);
    });

    return {
      fileName: `teacher-classes-${Date.now()}.csv`,
      csv: toCsv(rows),
    };
  }
}
