import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ClassStatus, ClassType } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const classSelect = {
  id: true,
  subject_id: true,
  title: true,
  description: true,
  cover_image: true,
  price: true,
  class_code: true,
  invitation_token: true,
  type: true,
  status: true,
  deleted_at: true,
  created_at: true,
  updated_at: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const normalizeClassType = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  return normalized === ClassType.PRIVATE ? ClassType.PRIVATE : ClassType.PUBLIC;
};

const normalizeClassStatus = (value?: string) => {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized === "DELETED" || normalized === "PENDING_DELETE") {
    return ClassStatus.PENDING_DELETE;
  }
  if (normalized === ClassStatus.PAUSED) {
    return ClassStatus.PAUSED;
  }
  return ClassStatus.ACTIVE;
};

const toClassResponse = (item: (typeof classSelect) & { subject?: any }) => ({
  id: item.id,
  subjectId: item.subject_id,
  title: item.title,
  description: item.description,
  coverImage: item.cover_image,
  price: item.price,
  classCode: item.class_code,
  invitationToken: item.invitation_token,
  type: item.type,
  status: item.status,
  deletedAt: item.deleted_at,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  subject: item.subject
    ? {
        id: item.subject.id,
        name: item.subject.name,
      }
    : null,
});

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  private get classDelegate() {
    return (this.prisma as any).class;
  }

  findAll() {
    return this.classDelegate
      .findMany({
      where: { deleted_at: null },
      select: classSelect,
      orderBy: { created_at: "desc" },
    })
      .then((classes: any[]) => classes.map((item) => toClassResponse(item)));
  }

  async findOne(id: string) {
    const item = await this.classDelegate.findFirst({
      where: { id, deleted_at: null },
      select: classSelect,
    });

    if (!item) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }

    return toClassResponse(item as any);
  }

  async create(dto: CreateClassDto) {
    try {
      const invitationToken = `join_${randomUUID().replace(/-/g, '')}`;

      const item = await this.classDelegate.create({
        data: {
          subject_id: dto.subjectId,
          title: dto.title,
          description: dto.description,
          cover_image: dto.coverImage,
          price: dto.price,
          class_code: dto.classCode,
          invitation_token: invitationToken,
          type: normalizeClassType(dto.type),
          status: normalizeClassStatus(dto.status),
        },
        select: classSelect,
      });
      return toClassResponse(item as any);
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateClassDto) {
    await this.ensureClassExists(id);

    try {
      const item = await this.classDelegate.update({
        where: { id },
        data: {
          subject_id: dto.subjectId,
          title: dto.title,
          description: dto.description,
          cover_image: dto.coverImage,
          price: dto.price,
          class_code: dto.classCode,
          invitation_token: dto.invitationToken,
          type: dto.type ? normalizeClassType(dto.type) : undefined,
          status: dto.status ? normalizeClassStatus(dto.status) : undefined,
          deleted_at: dto.deletedAt ? new Date(dto.deletedAt) : undefined,
        },
        select: classSelect,
      });
      return toClassResponse(item as any);
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureClassExists(id);

    await this.classDelegate.update({
      where: { id },
      data: {
        status: ClassStatus.PENDING_DELETE,
        deleted_at: new Date(),
      },
    });

    return {
      message: 'Class deleted successfully',
    };
  }

  private async ensureClassExists(id: string): Promise<void> {
    const item = await this.classDelegate.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });

    if (!item) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }
  }

  private handlePrismaError(error: unknown): never | void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new ConflictException('Class with unique field already exists');
    }
  }
}
