import { CreateCloudDocDto } from "./create-cloud-doc.api";

export class CreateCloudDocCommand {
  constructor(
    public readonly actorId: string,
    public readonly dto: CreateCloudDocDto,
  ) {}
}
