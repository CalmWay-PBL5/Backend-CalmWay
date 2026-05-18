import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PrismaService } from "@/infrastructure/database/prisma.service";
import { NotFoundException, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { UpdateSettingCommand } from "./update-setting.command";

@CommandHandler(UpdateSettingCommand)
export class UpdateSettingHandler
  implements ICommandHandler<UpdateSettingCommand>
{
  private readonly logger = new Logger(UpdateSettingHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async execute(command: UpdateSettingCommand) {
    const { key, adminId, dto } = command;

    const setting = await this.prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new NotFoundException(`Không tìm thấy cấu hình với mã: ${key}`);
    }

    await this.prisma.systemSetting.update({
      where: { key },
      data: {
        value: dto.value,
        updatedBy: adminId,
      },
    });

    await this.cacheManager.del(`SYSTEM_SETTING_${key}`);

    this.logger.log(
      `Admin [${adminId}] đã thay đổi cấu hình [${key}] thành [${dto.value}]`,
    );

    return { message: "Đã cập nhật cấu hình hệ thống thành công." };
  }
}
