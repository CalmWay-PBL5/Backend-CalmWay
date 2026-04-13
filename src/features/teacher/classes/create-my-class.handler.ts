import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClassType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { S3StorageService } from "@/infrastructure/storage/s3-storage.service";
import { mapClassEntity } from "./class.mapper";
import { CreateMyClassCommand } from "./create-my-class.command";

@CommandHandler(CreateMyClassCommand)
export class CreateMyClassHandler implements ICommandHandler<CreateMyClassCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async execute(command: CreateMyClassCommand) {
    const { teacherId, dto, coverImageFile } = command;

    const title = dto.title?.trim();
    if (!title) {
      throw new BadRequestException("Tên lớp học không được để trống.");
    }

    const price = Number(dto.price);
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException("Giá tiền không hợp lệ.");
    }

    const maxStudents = this.normalizeMaxStudents(dto.maxStudents);

    if (dto.type && !Object.values(ClassType).includes(dto.type)) {
      throw new BadRequestException(
        "Chế độ lớp học chỉ được là PUBLIC hoặc PRIVATE.",
      );
    }

    const subject = await this.resolveSubject(dto.subjectId);
    const classCode = await this.generateUniqueClassCode();
    const invitationToken =
      dto.type === ClassType.PRIVATE ? await this.generateUniqueInviteToken() : null;
    const coverImage = coverImageFile
      ? await this.storage.uploadFile(coverImageFile, "classes/covers")
      : undefined;

    const created = await this.prisma.class.create({
      data: {
        teacher_id: teacherId,
        subject_id: subject.id,
        title,
        description: this.toOptionalText(dto.description),
        price,
        cover_image: coverImage,
        class_code: classCode,
        invitation_token: invitationToken,
        max_students: maxStudents,
        type: dto.type || ClassType.PUBLIC,
      },
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

    return mapClassEntity(created);
  }

  private async resolveSubject(subjectId?: string) {
    if (subjectId?.trim()) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId.trim() },
        select: { id: true, name: true },
      });

      if (!subject) {
        throw new NotFoundException("Không tìm thấy môn học đã chọn.");
      }

      return subject;
    }

    const firstSubject = await this.prisma.subject.findFirst({
      orderBy: { created_at: "asc" },
      select: { id: true, name: true },
    });

    if (!firstSubject) {
      throw new BadRequestException(
        "Chưa có môn học nào trong hệ thống. Vui lòng tạo môn học trước.",
      );
    }

    return firstSubject;
  }

  private async generateUniqueClassCode() {
    for (let attempt = 0; attempt < 8; attempt++) {
      const random = Math.floor(Math.random() * 1_000_000)
        .toString()
        .padStart(6, "0");
      const code = `CLASS-${random}`;

      const existing = await this.prisma.class.findUnique({
        where: { class_code: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }

    throw new InternalServerErrorException("Không thể tạo mã lớp học duy nhất.");
  }

  private async generateUniqueInviteToken() {
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

    throw new InternalServerErrorException(
      "Không thể tạo mã mời lớp học duy nhất.",
    );
  }

  private toOptionalText(value?: string) {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeMaxStudents(value?: number) {
    if (typeof value === "undefined") {
      return 50;
    }

    const maxStudents = Number(value);
    if (!Number.isInteger(maxStudents) || maxStudents < 1) {
      throw new BadRequestException("Sĩ số tối đa không hợp lệ.");
    }

    return maxStudents;
  }
}
