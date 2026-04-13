import {
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from "@nestjs/common";
import { FILE_UPLOAD_RULES, UploadContext } from "./file-whitelist.constant";

@Injectable()
export class EnterpriseFilePipe implements PipeTransform {
  private readonly logger = new Logger(EnterpriseFilePipe.name);

  constructor(private readonly context: UploadContext) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Vui lòng tải lên một tệp đính kèm.");
    }

    const rules = FILE_UPLOAD_RULES[this.context];
    if (!rules) {
      this.logger.error(`Upload context [${this.context}] chưa được định nghĩa.`);
      throw new BadRequestException("Lỗi cấu hình hệ thống máy chủ.");
    }

    const maxSizeBytes = rules.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `Dung lượng file quá lớn. Tối đa cho phép: ${rules.maxSizeMB}MB. ${rules.description}`,
      );
    }

    const allowedMimes = rules.allowedMimes as readonly string[];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Định dạng file [${file.mimetype}] không được hỗ trợ. ${rules.description}`,
      );
    }

    return file;
  }
}
