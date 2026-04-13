import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SystemAdminController } from "./system-admin.controller";
import { UpdateSettingHandler } from "./settings/update-setting.handler";
import { RolesGuard } from "../auth/guards/roles.guard";

@Module({
  imports: [CqrsModule],
  controllers: [SystemAdminController],
  providers: [UpdateSettingHandler, RolesGuard],
})
export class SystemModule {}
