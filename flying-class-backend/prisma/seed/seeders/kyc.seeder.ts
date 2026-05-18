import { PrismaClient } from "@prisma/client";

export class KycSeeder {
  constructor(private readonly prisma: PrismaClient) {
    void this.prisma;
  }

  async run() {
    console.log("ℹ️ KycSeeder chưa triển khai dữ liệu mẫu ở bước này.");
  }
}
