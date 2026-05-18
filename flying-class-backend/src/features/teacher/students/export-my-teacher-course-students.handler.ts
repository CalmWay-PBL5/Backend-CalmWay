import { BadRequestException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TransactionStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { ExportMyTeacherCourseStudentsQuery } from "./export-my-teacher-course-students.query";
import { toCsv } from "./students-export.util";

@QueryHandler(ExportMyTeacherCourseStudentsQuery)
export class ExportMyTeacherCourseStudentsHandler
  implements IQueryHandler<ExportMyTeacherCourseStudentsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ExportMyTeacherCourseStudentsQuery) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: query.courseId,
        instructorId: query.teacherId,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!course) {
      throw new BadRequestException(
        "Không tìm thấy khóa học hoặc khóa học không thuộc về bạn.",
      );
    }

    const purchases = await this.prisma.courseTransaction.findMany({
      where: {
        courseId: query.courseId,
        status: TransactionStatus.SUCCESS,
      },
      distinct: ["studentId"],
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
        amount: true,
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

    const rows: Array<Array<string | number>> = [
      ["STT", "Email", "Ho ten", "So dien thoai", "So tien", "Ngay mua"],
    ];

    purchases.forEach((purchase, idx) => {
      rows.push([
        idx + 1,
        purchase.student.email,
        purchase.student.profile?.full_name || "",
        purchase.student.profile?.phone || "",
        purchase.amount,
        purchase.createdAt.toISOString(),
      ]);
    });

    return {
      fileName: `course-${course.id}-students-${Date.now()}.csv`,
      csv: toCsv(rows),
    };
  }
}
