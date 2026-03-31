import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class TeacherStudentExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Xuất toàn bộ danh sách học sinh ra file Excel
   */
  async exportStudentsToExcel(teacherId: string): Promise<Buffer> {
    try {
      // Bước 1: Lấy toàn bộ học sinh (không pagination)
      const students = await this.prisma.user.findMany({
        where: {
          role: 'STUDENT',
          status: 'ACTIVE',
          enrollments: {
            some: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          isVerified: true,
          createdAt: true,
          profile: {
            select: {
              fullName: true,
              phone: true,
              bio: true,
            },
          },
          enrollments: {
            where: {
              class: {
                teacherId: teacherId,
                status: 'active',
              },
            },
            select: {
              classId: true,
              status: true,
              joinedAt: true,
              class: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Bước 2: Tạo workbook và worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Danh sách học sinh', {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });

      // Bước 3: Set chiều rộng cột
      worksheet.columns = [
        { header: 'STT', key: 'index', width: 5 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Họ tên', key: 'fullName', width: 25 },
        { header: 'SĐT', key: 'phone', width: 15 },
        { header: 'Số lớp', key: 'enrollmentsCount', width: 10 },
        { header: 'Danh sách lớp', key: 'classes', width: 40 },
        { header: 'Xác thực', key: 'isVerified', width: 12 },
        { header: 'Ngày tham gia', key: 'createdAt', width: 18 },
      ];

      // Bước 4: Format header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12,
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };
      headerRow.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };

      // Bước 5: Thêm dữ liệu vào worksheet
      students.forEach((student, idx) => {
        const classNames = student.enrollments
          .map((e) => e.class.title)
          .join(', ');

        const row = worksheet.addRow({
          index: idx + 1,
          email: student.email,
          fullName: student.profile?.fullName || 'N/A',
          phone: student.profile?.phone || 'N/A',
          enrollmentsCount: student.enrollments.length,
          classes: classNames,
          isVerified: student.isVerified ? 'Có' : 'Không',
          createdAt: new Date(student.createdAt).toLocaleDateString('vi-VN'),
        });

        // Format data row
        row.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true,
        };

        // Alternate row colors
        if (idx % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        // Format số cột
        row.getCell('index').alignment = { horizontal: 'center' };
        row.getCell('enrollmentsCount').alignment = { horizontal: 'center' };
        row.getCell('isVerified').alignment = { horizontal: 'center' };
      });

      // Bước 6: Cấu hình in ấn
      worksheet.pageSetup.margins = {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.5,
        footer: 0.5,
      };

      // Bước 7: Đóng cột để auto-wrap
      worksheet.columns.forEach((column) => {
        if (column.key !== 'classes') {
          column.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });

      // Bước 8: Tạo summary sheet
      const summarySheet = workbook.addWorksheet('Thống kê');
      summarySheet.addRow(['Thống kê danh sách học sinh']);
      summarySheet.addRow(['Tổng số học sinh:', students.length]);
      summarySheet.addRow(['Ngày xuất:', new Date().toLocaleString('vi-VN')]);

      const summaryHeader = summarySheet.getRow(1);
      summaryHeader.font = { bold: true, size: 14 };

      // Bước 9: Convert workbook thành buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    } catch (error: any) {
      throw new BadRequestException(
        'Lỗi khi xuất file Excel: ' + error.message,
      );
    }
  }

  /**
   * Xuất danh sách học sinh của 1 lớp cụ thể
   */
  async exportClassStudentsToExcel(
    teacherId: string,
    classId: string,
  ): Promise<Buffer> {
    try {
      // Kiểm tra lớp có thuộc về giáo viên không
      const classItem = await this.prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: teacherId,
          status: 'active',
        },
      });

      if (!classItem) {
        throw new BadRequestException(
          'Không tìm thấy lớp hoặc lớp không thuộc về bạn',
        );
      }

      // Lấy danh sách học sinh trong lớp
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          classId: classId,
          status: 'ACTIVE',
        },
        include: {
          student: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      });

      // Tạo workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${classItem.title}`, {
        pageSetup: { paperSize: 9, orientation: 'landscape' },
      });

      // Set chiều rộng cột
      worksheet.columns = [
        { header: 'STT', key: 'index', width: 5 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Họ tên', key: 'fullName', width: 25 },
        { header: 'SĐT', key: 'phone', width: 15 },
        { header: 'Ngày tham gia', key: 'joinedAt', width: 18 },
        { header: 'Trạng thái', key: 'status', width: 12 },
      ];

      // Format header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12,
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' },
      };
      headerRow.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };

      // Thêm dữ liệu
      enrollments.forEach((enrollment, idx) => {
        const row = worksheet.addRow({
          index: idx + 1,
          email: enrollment.student.email,
          fullName: enrollment.student.profile?.fullName || 'N/A',
          phone: enrollment.student.profile?.phone || 'N/A',
          joinedAt: new Date(enrollment.joinedAt).toLocaleDateString('vi-VN'),
          status: enrollment.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động',
        });

        // Alternate row colors
        if (idx % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' },
          };
        }

        row.alignment = {
          horizontal: 'left',
          vertical: 'middle',
        };
      });

      // Tạo summary sheet
      const summarySheet = workbook.addWorksheet('Thông tin lớp');
      summarySheet.addRow(['Tên lớp:', classItem.title]);
      summarySheet.addRow(['Mô tả:', classItem.description || 'N/A']);
      summarySheet.addRow(['Mã lớp:', classItem.classCode]);
      summarySheet.addRow(['Giá:', classItem.price ? `${classItem.price} VND` : 'Miễn phí']);
      summarySheet.addRow(['Tổng học sinh:', enrollments.length]);
      summarySheet.addRow(['Ngày xuất:', new Date().toLocaleString('vi-VN')]);

      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    } catch (error: any) {
      throw new BadRequestException(
        'Lỗi khi xuất file Excel: ' + error.message,
      );
    }
  }
}
