import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      fullName: true,
      phone: true,
      avatar: true,
      bio: true,
      parentEmail: true,
      identifyCardUrl: true,
    },
  },
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: dto.passwordHash,
          role: dto.role ?? UserRole.STUDENT,
          status: dto.status ?? UserStatus.ACTIVE,
          isVerified: dto.isVerified ?? false,
          profile:
            dto.fullName ||
            dto.phone ||
            dto.avatar ||
            dto.bio ||
            dto.parentEmail ||
            dto.identifyCardUrl
              ? {
                  create: {
                    fullName: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    bio: dto.bio,
                    parentEmail: dto.parentEmail,
                    identifyCardUrl: dto.identifyCardUrl,
                  },
                }
              : undefined,
        },
        select: userSelect,
      });

      return user;
    } catch (error: unknown) {
      this.handlePrismaError(error, dto.email);
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.ensureUserExists(id);

    try {
      const hasProfilePayload =
        dto.fullName !== undefined ||
        dto.phone !== undefined ||
        dto.avatar !== undefined ||
        dto.bio !== undefined ||
        dto.parentEmail !== undefined ||
        dto.identifyCardUrl !== undefined;

      const user = await this.prisma.user.update({
        where: { id },
        data: {
          email: dto.email,
          passwordHash: dto.passwordHash,
          role: dto.role,
          status: dto.status,
          isVerified: dto.isVerified,
          profile: hasProfilePayload
            ? {
                upsert: {
                  create: {
                    fullName: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    bio: dto.bio,
                    parentEmail: dto.parentEmail,
                    identifyCardUrl: dto.identifyCardUrl,
                  },
                  update: {
                    fullName: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    bio: dto.bio,
                    parentEmail: dto.parentEmail,
                    identifyCardUrl: dto.identifyCardUrl,
                  },
                },
              }
            : undefined,
        },
        select: userSelect,
      });

      return user;
    } catch (error: unknown) {
      this.handlePrismaError(error, dto.email);
      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureUserExists(id);

    await this.prisma.user.delete({ where: { id } });

    return {
      message: 'User deleted successfully',
    };
  }

  private async ensureUserExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  private handlePrismaError(error: unknown, email?: string): never | void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new ConflictException(
        `User with email ${email ?? 'provided'} already exists`,
      );
    }
  }
}
