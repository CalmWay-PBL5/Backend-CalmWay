import { MailBuilderService } from "./mail-builder.service";
import { MailTransportService } from "./mail-transport.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [MailBuilderService, MailTransportService],
  exports: [MailBuilderService, MailTransportService],
})
export class MailerModule {}
