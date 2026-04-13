import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { LessonsController } from "./lessons.controller";
import { CreateCloudDocHandler } from "./cloud-doc/create-cloud-doc.handler";
import { ListCloudDocsHandler } from "./cloud-doc/list-cloud-docs.handler";
import { UpdateCloudDocTitleHandler } from "./cloud-doc/update-cloud-doc-title.handler";
import { DeleteCloudDocHandler } from "./cloud-doc/delete-cloud-doc.handler";

@Module({
  imports: [CqrsModule],
  controllers: [LessonsController],
  providers: [
    CreateCloudDocHandler,
    ListCloudDocsHandler,
    UpdateCloudDocTitleHandler,
    DeleteCloudDocHandler,
  ],
})
export class LessonsModule {}
