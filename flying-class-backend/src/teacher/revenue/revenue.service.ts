import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class RevenueService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. TỔNG QUAN HIỆN TẠI (Tính real-time cho giao diện Card)
  async getRevenueSummary(filterDto: { teacherId?: string }) {
    const { teacherId } = filterDto;
    const classes = await this.prisma.class.findMany({
      where: { ...(teacherId ? { teacherId } : {}), status: 'active' },
      select: {
        id: true, title: true, classCode: true, price: true,
        _count: { select: { enrollments: { where: { status: 'ACTIVE' } } } },
      },
    });

    let totalRevenue = 0;
    let totalStudents = 0;

    const revenueByClass = classes.map((cls) => {
      const studentCount = cls._count.enrollments;
      const classRevenue = studentCount * Number(cls.price || 0);
      totalRevenue += classRevenue;
      totalStudents += studentCount;
      return { classId: cls.id, className: cls.title, studentCount, revenue: classRevenue };
    }).sort((a, b) => b.revenue - a.revenue);

    return { totalRevenue, totalClasses: classes.length, totalStudents, revenueByClass };
  }

  // 2. BIỂU ĐỒ THEO THÁNG (Truy vấn siêu tốc từ bảng Snapshot)
  async getMonthlyRevenue(year: number, teacherId: string) {
    // Tự động gom nhóm (GROUP BY) theo tháng từ sổ cái
    const snapshots = await this.prisma.monthlyRevenueSnapshot.groupBy({
      by: ['month'],
      where: { year, teacherId },
      _sum: { totalRevenue: true },
      orderBy: { month: 'asc' }
    });

    // Tạo mảng 12 tháng mặc định
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
    }));

    // Đắp dữ liệu có thật vào mảng
    snapshots.forEach(snap => {
      monthlyData[snap.month - 1].total = Number(snap._sum.totalRevenue || 0);
    });

    return monthlyData;
  }
}