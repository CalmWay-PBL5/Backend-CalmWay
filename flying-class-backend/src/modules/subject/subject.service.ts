import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

const subjectSelect = {
  id: true,
  name: true,
  description: true,
  created_at: true,
} as const;

const toSubjectResponse = (subject: (typeof subjectSelect) & { created_at?: Date }) => ({
  id: subject.id,
  name: subject.name,
  description: subject.description,
  createdAt: subject.created_at,
});

@Injectable()
export class SubjectService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.subject
      .findMany({
      select: subjectSelect,
      orderBy: { name: 'asc' },
    })
      .then((subjects) => subjects.map((subject) => toSubjectResponse(subject as any)));
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: subjectSelect,
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }

    return toSubjectResponse(subject as any);
  }

  async create(dto: CreateSubjectDto) {
    try {
      const subject = await this.prisma.subject.create({
        data: {
          name: dto.name,
          description: dto.description,
        },
        select: subjectSelect,
      });
      return toSubjectResponse(subject as any);
    } catch (error: unknown) {
      this.handlePrismaError(error, dto.name);
      throw error;
    }
  }

  async update(id: string, dto: UpdateSubjectDto) {
    await this.ensureSubjectExists(id);

    try {
      const subject = await this.prisma.subject.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
        },
        select: subjectSelect,
      });
      return toSubjectResponse(subject as any);
    } catch (error: unknown) {
      this.handlePrismaError(error, dto.name);
      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureSubjectExists(id);

    await this.prisma.subject.delete({ where: { id } });

    return {
      message: 'Subject deleted successfully',
    };
  }

  private async ensureSubjectExists(id: string): Promise<void> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
  }

  private handlePrismaError(error: unknown, name?: string): never | void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new ConflictException(
        `Subject with name ${name ?? 'provided'} already exists`,
      );
    }
  }
}
