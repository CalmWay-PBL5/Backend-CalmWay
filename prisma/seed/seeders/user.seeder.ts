import { PrismaClient, Role } from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as argon2 from "argon2";
import { DEFAULT_ADMIN } from "../data/constants";

export class UserSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async run() {
    console.log("⏳ Đang xử lý dữ liệu Users...");

    const defaultPasswordHash = await argon2.hash("password123");

    await this.prisma.user.upsert({
      where: { email: DEFAULT_ADMIN.email },
      update: {},
      create: {
        email: DEFAULT_ADMIN.email,
        password: await argon2.hash(DEFAULT_ADMIN.password),
        role: Role.ADMIN,
        is_verified: true,
      },
    });
    console.log(`✅ Đã đảm bảo tài khoản Admin tồn tại (${DEFAULT_ADMIN.email})`);

    const fakeUsers: Array<{
      email: string;
      password: string;
      role: Role;
      is_verified: boolean;
      created_at: Date;
    }> = [];

    for (let i = 0; i < 50; i++) {
      fakeUsers.push({
        email: faker.internet.email(),
        password: defaultPasswordHash,
        role: faker.helpers.arrayElement([Role.STUDENT, Role.LECTURER]),
        is_verified: faker.datatype.boolean({ probability: 0.8 }),
        created_at: faker.date.past({ years: 1 }),
      });
    }

    const result = await this.prisma.user.createMany({
      data: fakeUsers,
      skipDuplicates: true,
    });

    console.log(`✅ Đã tạo thành công ${result.count} Users giả ngẫu nhiên.`);
  }
}
