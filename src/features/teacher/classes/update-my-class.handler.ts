import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassStatus, ClassType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import { mapClassEntity } from "./class.mapper";
import { UpdateMyClassCommand } from "./update-my-class.command";

@CommandHandler(UpdateMyClassCommand)
export class UpdateMyClassHandler implements ICommandHandler<UpdateMyClassCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async execute(command: UpdateMyClassCommand) {
    const { teacherId, classId, dto, coverImageFile } = command;

    const existing = await this.prisma.class.findFirst({
      where: {
        id: classId,
        teacher_id: teacherId,
        status: ClassStatus.ACTIVE,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Không tìm thấy lớp học để cập nhật.");
    }

    const data: Record<string, unknown> = {};

    if (typeof dto.title === "string") {
      const title = dto.title.trim();
      if (!title) {
        throw new BadRequestException("Tên lớp học không được để trống.");
      }
      data.title = title;
    }

    if (typeof dto.description === "string") {
      data.description = this.toOptionalText(dto.description);
    }

    if (typeof dto.price !== "undefined") {
      const price = Number(dto.price);
      if (!Number.isFinite(price) || price < 0) {
        throw new BadRequestException("Giá tiền không hợp lệ.");
      }
      data.price = price;
    }

    if (typeof dto.maxStudents !== "undefined") {
      const maxStudents = Number(dto.maxStudents);
      if (!Number.isInteger(maxStudents) || maxStudents < 1) {
        throw new BadRequestException("Sĩ số tối đa không hợp lệ.");
      }
      data.max_students = maxStudents;
    }

    if (dto.type) {
      if (!Object.values(ClassType).includes(dto.type)) {
        throw new BadRequestException(
          "Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE.",
        );
      }

      data.type = dto.type;
      data.invitation_token =
        dto.type === "PRIVATE"
          ? await this.ensureInvitationToken(classId)
          : null;
    }

    if (dto.subjectId?.trim()) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: dto.subjectId.trim() },
        select: { id: true },
      });

      if (!subject) {
        throw new NotFoundException("Không tìm thấy môn học đã chọn.");
      }

      data.subject_id = subject.id;
    }

    if (coverImageFile) {
      data.cover_image = await this.storage.uploadFile(coverImageFile, "classes/covers");
    }

    if (!Object.keys(data).length) {
      const current = await this.prisma.class.findUnique({
        where: { id: classId },
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          transactions: {
            select: {
              user_id: true,
              amount: true,
              status: true,
            },
          },
          classMembers: {
            select: {
              student_id: true,
              status: true,
              joined_at: true,
            },
          },
        },
      });

      if (!current) {
        throw new NotFoundException("Không tìm thấy lớp học để cập nhật.");
      }

      return mapClassEntity(current);
    }

    const updated = await this.prisma.class.update({
      where: { id: classId },
      data,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          select: {
            user_id: true,
            amount: true,
            status: true,
          },
        },
        classMembers: {
          select: {
            student_id: true,
            status: true,
            joined_at: true,
          },
        },
      },
    });

    return mapClassEntity(updated);
  }

  private async ensureInvitationToken(classId: string) {
    const current = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { invitation_token: true },
    });

    if (current?.invitation_token) {
      return current.invitation_token;
    }

    for (let attempt = 0; attempt < 8; attempt++) {
      const random = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      const existing = await this.prisma.class.findFirst({
        where: { invitation_token: random },
        select: { id: true },
      });

      if (!existing) {
        return random;
      }
    }

    throw new BadRequestException("Không thể tạo mã mời lớp học.");
  }

  private toOptionalText(value?: string) {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
}
