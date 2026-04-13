import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { MailerModule } from "./mailer/mailer.module";
import { SystemSettingService } from "./settings/system-setting.service";

@Global()
@Module({
  imports: [MailerModule, CacheModule.register()],
  providers: [SystemSettingService],
  exports: [MailerModule, CacheModule, SystemSettingService],
})
export class SharedModule {}
