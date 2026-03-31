import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClassExportService {
  constructor(private prisma: PrismaService) {}

  async exportClassesToExcel(teacherId: string): Promise<string> {
    // Lấy danh sách lớp của teacher
    const classes = await this.prisma.class.findMany({
      where: {
        teacherId: teacherId,
        status: 'active',
      },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          select: { id: true },
        },
        subject: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách lớp học');

    // ==========================================
    // CẤU HÌNH TIÊU ĐỀ
    // ==========================================
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Tên lớp học', key: 'title', width: 25 },
      { header: 'Mã lớp', key: 'classCode', width: 15 },
      { header: 'Môn học', key: 'subject', width: 15 },
      { header: 'Mô tả', key: 'description', width: 30 },
      { header: 'Giá tiền (VND)', key: 'price', width: 15 },
      { header: 'Số học sinh', key: 'studentCount', width: 12 },
      { header: 'Sĩ số tối đa', key: 'maxStudents', width: 12 },
      { header: 'Loại lớp', key: 'type', width: 12 },
      { header: 'Ngày tạo', key: 'createdAt', width: 18 },
    ];

    // ==========================================
    // ĐỊNH DẠNG TIÊU ĐỀ
    // ==========================================
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }, // Xanh đậm
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    // ==========================================
    // THÊM DỮ LIỆU VÀO SHEET
    // ==========================================
    classes.forEach((classItem: any, index: number) => {
      worksheet.addRow({
        stt: index + 1,
        title: classItem.title || '',
        classCode: classItem.classCode || '',
        subject: classItem.subject?.name || 'N/A',
        description: classItem.description || '',
        price: Number(classItem.price),
        studentCount: classItem.enrollments.length,
        maxStudents: classItem.maxStudents,
        type: classItem.type || 'PUBLIC',
        createdAt: new Date(classItem.createdAt).toLocaleDateString('vi-VN'),
      });
    });

    // ==========================================
    // ĐỊNH DẠNG DỮ LIỆU
    // ==========================================
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Bỏ qua header

      row.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };

      // Định dạng tiền tệ
      const priceCell = row.getCell('price');
      if (priceCell.value) {
        priceCell.numFmt = '#,##0';
      }

      // Thay đổi màu nền cho các hàng chẵn
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }, // Xám nhạt
          };
        });
      }
    });

    // ==========================================
    // TẠO FILE VÀ LƯU VÀO THƯ MỤC UPLOADS
    // ==========================================
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileName = `danh-sach-lop-${timestamp}.xlsx`;
    const filePath = path.join(uploadsDir, fileName);

    await workbook.xlsx.writeFile(filePath);

    return fileName;
  }

  async exportClassMembersToExcel(
    classId: string,
    teacherId: string,
  ): Promise<string> {
    // Kiểm tra xem lớp có thuộc về teacher không
    const classItem = await this.prisma.class.findFirst({
      where: { id: classId, teacherId },
    });

    if (!classItem) {
      throw new Error('Lớp học không tồn tại hoặc không phải của bạn');
    }

    // Lấy danh sách học sinh của lớp
    const members = await this.prisma.enrollment.findMany({
      where: {
        classId: classId,
        status: 'ACTIVE',
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Danh sách - ${classItem.title}`);

    // ==========================================
    // CẤU HÌNH TIÊU ĐỀ
    // ==========================================
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Họ & Tên', key: 'fullName', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Ngày tham gia', key: 'joinedAt', width: 18 },
    ];

    // ==========================================
    // ĐỊNH DẠNG TIÊU ĐỀ
    // ==========================================
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF70AD47' }, // Xanh lá
    };
    headerRow.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };

    // ==========================================
    // THÊM DỮ LIỆU VÀO SHEET
    // ==========================================
    members.forEach((member: any, index: number) => {
      worksheet.addRow({
        stt: index + 1,
        fullName: member.student.profile?.fullName || 'N/A',
        email: member.student.email || '',
        phone: member.student.profile?.phone || 'N/A',
        joinedAt: new Date(member.joinedAt).toLocaleDateString('vi-VN'),
      });
    });

    // ==========================================
    // ĐỊNH DẠNG DỮ LIỆU
    // ==========================================
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Bỏ qua header

      row.alignment = {
        horizontal: 'left',
        vertical: 'middle',
        wrapText: true,
      };

      // Thay đổi màu nền cho các hàng chẵn
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }, // Xám nhạt
          };
        });
      }
    });

    // ==========================================
    // TẠO FILE VÀ LƯU VÀO THƯ MỤC UPLOADS
    // ==========================================
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedClassName = classItem.title
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase();
    const fileName = `danh-sach-hoc-sinh-${sanitizedClassName}-${timestamp}.xlsx`;
    const filePath = path.join(uploadsDir, fileName);

    await workbook.xlsx.writeFile(filePath);

    return fileName;
  }
}
