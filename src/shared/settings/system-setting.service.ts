import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "@/infrastructure/database/prisma.service";

@Injectable()
export class SystemSettingService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAsNumber(key: string): Promise<number> {
    const cacheKey = `SYSTEM_SETTING_${key}`;

    let value = await this.cacheManager.get<string>(cacheKey);

    if (!value) {
      const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
      value = setting?.value || "0";

      await this.cacheManager.set(cacheKey, value, 3600);
    }

    return Number(value);
  }

  async getAsBoolean(key: string): Promise<boolean> {
    const cacheKey = `SYSTEM_SETTING_${key}`;
    let value = await this.cacheManager.get<string>(cacheKey);

    if (!value) {
      const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
      value = setting?.value || "false";
      await this.cacheManager.set(cacheKey, value, 3600);
    }

    return value === "true";
  }
}
