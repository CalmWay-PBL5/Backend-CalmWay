import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { TeacherStudentService } from './teacher-student.service';
import { TeacherStudentExportService } from './teacher-student-export.service';

@Controller('teachers/me/students')
export class TeacherStudentController {
  constructor(
    private readonly teacherStudentService: TeacherStudentService,
    private readonly exportService: TeacherStudentExportService,
  ) {}

  private readonly fakeTeacherId = 'e350d7e6-ba21-4abf-ba8e-a36263f2434b';

  /**
   * GET /teachers/me/students
   * Lấy danh sách toàn bộ học sinh tham gia ít nhất 1 lớp của giáo viên
   */
  @Get()
  async getAllStudents(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    console.log('🔥 GET /api/v1/teachers/me/students called!');

    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;

    if (isNaN(skipNum) || isNaN(takeNum)) {
      throw new BadRequestException('skip và take phải là số');
    }

    if (takeNum > 100) {
      throw new BadRequestException('take không được vượt quá 100');
    }

    const result = await this.teacherStudentService.getAllStudents(
      this.fakeTeacherId,
      skipNum,
      takeNum,
    );

    return {
      status: 'success',
      message: 'Lấy danh sách học sinh thành công',
      data: result.data,
      pagination: {
        total: result.total,
        skip: result.skip,
        take: result.take,
        hasMore: result.skip + result.take < result.total,
      },
    };
  }

  /**
   * GET /teachers/me/students/search
   * Tìm kiếm học sinh trong danh sách của giáo viên
   * ⚠️ QUAN TRỌNG: Endpoint này phải nằm TRƯỚC @Get(':studentId')
   */
  @Get('search/query')
  async searchStudents(
    @Query('q') query?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    console.log('🔥 GET /api/v1/teachers/me/students/search/query called!');

    if (!query) {
      throw new BadRequestException('Tham số "q" không được để trống');
    }

    const skipNum = skip ? parseInt(skip, 10) : 0;
    const takeNum = take ? parseInt(take, 10) : 20;

    if (isNaN(skipNum) || isNaN(takeNum)) {
      throw new BadRequestException('skip và take phải là số');
    }

    const result = await this.teacherStudentService.searchStudents(
      this.fakeTeacherId,
      query,
      skipNum,
      takeNum,
    );

    return {
      status: 'success',
      message: 'Tìm kiếm học sinh thành công',
      data: result.data,
      pagination: {
        total: result.total,
        skip: result.skip,
        take: result.take,
      },
    };
  }

  /**
   * GET /teachers/me/students/stats
   * Lấy thống kê học sinh của giáo viên
   * ⚠️ QUAN TRỌNG: Endpoint này phải nằm TRƯỚC @Get(':studentId')
   */
  @Get('stats/overview')
  async getStudentStats() {
    console.log('🔥 GET /api/v1/teachers/me/students/stats/overview called!');

    const stats = await this.teacherStudentService.getStudentStats(
      this.fakeTeacherId,
    );

    return {
      status: 'success',
      message: 'Lấy thống kê học sinh thành công',
      data: stats,
    };
  }

  /**
   * GET /teachers/me/students/export/all
   * Xuất toàn bộ danh sách học sinh ra file Excel
   * ⚠️ QUAN TRỌNG: Endpoint này phải nằm TRƯỚC @Get(':studentId')
   */
  @Get('export/all')
  async exportAllStudents(@Res() res: Response) {
    console.log('🔥 GET /api/v1/teachers/me/students/export/all called!');

    try {
      const fileBuffer = await this.exportService.exportStudentsToExcel(
        this.fakeTeacherId,
      );

      // Set headers để trả về file download
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="danh-sach-hoc-sinh-${new Date().getTime()}.xlsx"`,
      );

      res.send(fileBuffer);
    } catch (error: any) {
      console.error('Lỗi xuất Excel:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Lỗi khi xuất file Excel',
      });
    }
  }

  /**
   * GET /teachers/me/students/export/class/:classId
   * Xuất danh sách học sinh của 1 lớp ra file Excel
   * ⚠️ QUAN TRỌNG: Endpoint này phải nằm TRƯỚC @Get(':studentId')
   */
  @Get('export/class/:classId')
  async exportClassStudents(
    @Param('classId') classId: string,
    @Res() res: Response,
  ) {
    console.log('🔥 GET /api/v1/teachers/me/students/export/class/:classId called!');
    console.log('📦 classId:', classId);

    try {
      const fileBuffer = await this.exportService.exportClassStudentsToExcel(
        this.fakeTeacherId,
        classId,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="danh-sach-lop-${new Date().getTime()}.xlsx"`,
      );

      res.send(fileBuffer);
    } catch (error: any) {
      console.error('Lỗi xuất Excel:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Lỗi khi xuất file Excel',
      });
    }
  }

  /**
   * GET /teachers/me/students/:studentId
   * Lấy chi tiết 1 học sinh (bao gồm lịch sử học tập)
   * Bảo mật: Chỉ trả về chi tiết nếu học sinh này tham gia lớp của giáo viên
   */
  @Get(':studentId')
  async getStudentDetail(@Param('studentId') studentId: string) {
    console.log('🔥 GET /api/v1/teachers/me/students/:studentId called!');
    console.log('📦 studentId:', studentId);

    const student = await this.teacherStudentService.getStudentDetail(
      this.fakeTeacherId,
      studentId,
    );

    return {
      status: 'success',
      message: 'Lấy chi tiết học sinh thành công',
      data: student,
    };
  }
}
