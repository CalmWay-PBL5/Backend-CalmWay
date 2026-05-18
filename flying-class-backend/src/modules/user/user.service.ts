import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, UserStatus } from "@prisma/client";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  is_verified: true,
  created_at: true,
  updated_at: true,
  profile: {
    select: {
      full_name: true,
      phone: true,
      avatar: true,
      bio: true,
      parent_email: true,
      identify_card_url: true,
    },
  },
} as const;

const mapRole = (role?: Role | "TEACHER") => {
  if (!role) return undefined;
  return role === "TEACHER" ? Role.LECTURER : role;
};

const toUserResponse = (user: (typeof userSelect) & { profile?: any }) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  status: user.status,
  isVerified: user.is_verified,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  profile: user.profile
    ? {
        fullName: user.profile.full_name,
        phone: user.profile.phone,
        avatar: user.profile.avatar,
        bio: user.profile.bio,
        parentEmail: user.profile.parent_email,
        identifyCardUrl: user.profile.identify_card_url,
      }
    : null,
});

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { created_at: "desc" },
    }).then((users) => users.map((user) => toUserResponse(user as any)));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return toUserResponse(user as any);
  }

  async create(dto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: dto.passwordHash,
          role: mapRole(dto.role) ?? Role.STUDENT,
          status: dto.status ?? UserStatus.ACTIVE,
          is_verified: dto.isVerified ?? false,
          profile:
            dto.fullName ||
            dto.phone ||
            dto.avatar ||
            dto.bio ||
            dto.parentEmail ||
            dto.identifyCardUrl
              ? {
                  create: {
                    full_name: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    bio: dto.bio,
                    parent_email: dto.parentEmail,
                    identify_card_url: dto.identifyCardUrl,
                  },
                }
              : undefined,
        },
        select: userSelect,
      });

      return toUserResponse(user as any);
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
          password: dto.passwordHash,
          role: mapRole(dto.role),
          status: dto.status,
          is_verified: dto.isVerified,
          profile: hasProfilePayload
            ? {
                upsert: {
                  create: {
                    full_name: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    bio: dto.bio,
                    parent_email: dto.parentEmail,
                    identify_card_url: dto.identifyCardUrl,
                  },
                  update: {
                    full_name: dto.fullName,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    bio: dto.bio,
                    parent_email: dto.parentEmail,
                    identify_card_url: dto.identifyCardUrl,
                  },
                },
              }
            : undefined,
        },
        select: userSelect,
      });

      return toUserResponse(user as any);
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
