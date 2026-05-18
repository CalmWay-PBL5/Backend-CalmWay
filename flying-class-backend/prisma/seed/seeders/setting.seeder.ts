import { PrismaClient, DataType } from "@prisma/client";

export class SettingSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async run() {
    console.log("⏳ Đang khởi tạo Cấu hình hệ thống mặc định...");

    const defaultSettings = [
      {
        key: "PLATFORM_COMMISSION_RATE",
        name: "Tỷ lệ hoa hồng nền tảng (%)",
        value: "20",
        dataType: DataType.NUMBER,
        description:
          "Phần trăm doanh thu nền tảng giữ lại từ mỗi giao dịch mua khóa học.",
      },
      {
        key: "REQUIRE_KYC_TO_TEACH",
        name: "Bắt buộc xác minh KYC để dạy học",
        value: "true",
        dataType: DataType.BOOLEAN,
        description:
          "Nếu bật, user phải được duyệt KYC mới có thể tạo khóa học.",
      },
      {
        key: "MAX_VIDEO_UPLOAD_SIZE_MB",
        name: "Dung lượng Video tối đa (MB)",
        value: "2048",
        dataType: DataType.NUMBER,
        description: "Giới hạn dung lượng mỗi file video bài giảng tải lên Minio.",
      },
    ];

    for (const setting of defaultSettings) {
      await this.prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    console.log("✅ Khởi tạo cấu hình hệ thống thành công.");
  }
}
