import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UsersAdminController } from "./users-admin.controller";
import { ToggleUserStatusHandler } from "./toggle-status/toggle-status.handler";
import { RolesGuard } from "../auth/guards/roles.guard";

@Module({
  imports: [CqrsModule],
  controllers: [UsersAdminController],
  providers: [ToggleUserStatusHandler, RolesGuard],
})
export class UsersModule {}
