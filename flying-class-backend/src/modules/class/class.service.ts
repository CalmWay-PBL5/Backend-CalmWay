import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const classSelect = {
  id: true,
  subjectId: true,
  title: true,
  description: true,
  coverImage: true,
  price: true,
  classCode: true,
  invitationToken: true,
  type: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

@Injectable()
export class ClassService {
  constructor(private readonly prisma: PrismaService) {}

  private get classDelegate() {
    return (this.prisma as any).class;
  }

  findAll() {
    return this.classDelegate.findMany({
      where: { deletedAt: null },
      select: classSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const item = await this.classDelegate.findFirst({
      where: { id, deletedAt: null },
      select: classSelect,
    });

    if (!item) {
      throw new NotFoundException(`Class with id ${id} not found`);
    }

    return item;
  }

  async create(dto: CreateClassDto) {
    try {
      const invitationToken = `join_${randomUUID().replace(/-/g, '')}`;

      return await this.classDelegate.create({
        data: {
          subjectId: dto.subjectId,
          title: dto.title,
          description: dto.description,
          coverImage: dto.coverImage,
          price: dto.price,
          classCode: dto.classCode,
          invitationToken,
          type: dto.type,
          status: dto.status,
        },
        select: classSelect,
      });
    } catch (error: unknown) {
      this.handlePrismaError(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateClassDto) {
    await this.ensureClassExists(id);

    try {
      return await this.classDelegate.update({
        where: { id },
        data: {
          subjectId: dto.subjectId,
          title: dto.title,
          description: dto.description,
          coverImage: dto.coverImage,
          price: dto.price,
          classCode: dto.classCode,
          invitationToken: dto.invitationToken,
          type: dto.type,
          status: dto.status,
          deletedAt: dto.deletedAt,
        },
        select: classSelect,
      });
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
        status: 'deleted',
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Class deleted successfully',
    };
  }

  private async ensureClassExists(id: string): Promise<void> {
    const item = await this.classDelegate.findFirst({
      where: { id, deletedAt: null },
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
