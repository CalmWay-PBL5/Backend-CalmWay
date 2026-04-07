import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class RevenueCronService {
  private readonly logger = new Logger(RevenueCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Chạy vào 00:01 sáng của ngày mùng 1 mỗi tháng
  @Cron('* * * * *')
  async handleMonthlyRevenueSnapshot() {
    this.logger.log('🤖 Bắt đầu chạy Bot chốt sổ doanh thu tháng...');
    try {
      // 1. Tính toán tháng cần chốt (Lùi 1 tháng so với hiện tại)
      const now = new Date();
      let targetMonth = now.getMonth(); // Hàm getMonth() trả từ 0-11 (tháng 1 là 0)
      let targetYear = now.getFullYear();

      if (targetMonth === 0) { // Nếu đang là tháng 1, thì chốt sổ cho tháng 12 năm ngoái
        targetMonth = 12;
        targetYear -= 1;
      }

      // 2. Lấy tất cả lớp đang hoạt động và đếm số HS đang ACTIVE
      const classes = await this.prisma.class.findMany({
        where: { status: 'active' }, // Điều chỉnh điều kiện status tùy logic của bạn
        select: {
          id: true,
          teacherId: true,
          price: true,
          _count: {
            select: { enrollments: { where: { status: 'ACTIVE' } } }
          }
        }
      });

      // 3. Ghi vào sổ cái (Upsert để lỡ chạy lại cũng không bị đúp dữ liệu)
      for (const cls of classes) {
        const studentCount = cls._count.enrollments;
        const priceApplied = Number(cls.price || 0);
        const totalRevenue = studentCount * priceApplied;

        await this.prisma.monthlyRevenueSnapshot.upsert({
          where: {
            classId_month_year: {
              classId: cls.id,
              month: targetMonth,
              year: targetYear
            }
          },
          update: { studentCount, priceApplied, totalRevenue },
          create: {
            classId: cls.id,
            teacherId: cls.teacherId,
            month: targetMonth,
            year: targetYear,
            studentCount,
            priceApplied,
            totalRevenue
          }
        });
      }
      this.logger.log(`✅ Chốt sổ thành công ${classes.length} lớp cho Tháng ${targetMonth}/${targetYear}.`);
    } catch (error) {
      this.logger.error('❌ Lỗi khi chốt sổ doanh thu:', error);
    }
  }
}