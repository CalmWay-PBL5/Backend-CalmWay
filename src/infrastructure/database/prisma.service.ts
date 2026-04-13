import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; // Required by @prisma/adapter-pg
import { AppConfigService } from "@/core/config/app-config.service";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);
  private isDisconnected = false;

  constructor(configService: AppConfigService) {
    const databaseUrl = configService.get("DATABASE_URL");

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ["error", "warn"],
      errorFormat: "colorless",
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(
        "📦 Successfully connected to PostgreSQL via Prisma v7 Adapter.",
      );
    } catch (error) {
      this.logger.error("❌ Failed to connect to the database", error);
      throw error;
    }
  }

  async onApplicationShutdown(signal?: string) {
    if (this.isDisconnected) {
      return;
    }

    this.logger.log(
      `🛑 Received shutdown signal${signal ? ` (${signal})` : ""}. Disconnecting Prisma...`,
    );
    await this.$disconnect();
    this.isDisconnected = true;
    this.logger.log("🛑 Disconnected from PostgreSQL.");
  }
}
