import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Role, TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ExportMyTeacherStudentsQuery } from "./export-my-teacher-students.query";
import { toCsv } from "./students-export.util";

@QueryHandler(ExportMyTeacherStudentsQuery)
export class ExportMyTeacherStudentsHandler
  implements IQueryHandler<ExportMyTeacherStudentsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ExportMyTeacherStudentsQuery) {
    const students = await this.prisma.user.findMany({
      where: {
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
      orderBy: {
        created_at: "desc",
      },
      select: {
        email: true,
        created_at: true,
        profile: {
          select: {
            full_name: true,
            phone: true,
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
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    const rows: Array<Array<string | number>> = [
      [
        "STT",
        "Email",
        "Ho ten",
        "So dien thoai",
        "So khoa hoc da mua",
        "Tong chi tieu",
        "Danh sach khoa hoc",
        "Ngay tham gia",
      ],
    ];

    students.forEach((student, idx) => {
      rows.push([
        idx + 1,
        student.email,
        student.profile?.full_name || "",
        student.profile?.phone || "",
        student.courseTransactions.length,
        student.courseTransactions.reduce((sum, item) => sum + item.amount, 0),
        student.courseTransactions.map((item) => item.course.title).join(" | "),
        student.created_at.toISOString(),
      ]);
    });

    return {
      fileName: `teacher-students-${Date.now()}.csv`,
      csv: toCsv(rows),
    };
  }
}
