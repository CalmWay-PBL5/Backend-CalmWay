import { Controller, Get, Query, Version } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { GetMonthlyRevenueDto, GetRevenueFilterDto } from './dto/get-revenue-filter.dto';

@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  private readonly TEST_TEACHER_ID = 'e350d7e6-ba21-4abf-ba8e-a36263f2434b';

  @Get('summary')
  async getSummary() {
    return this.revenueService.getRevenueSummary({ teacherId: this.TEST_TEACHER_ID });
  }

  @Get('monthly')
  async getMonthly(@Query() queryDto: GetMonthlyRevenueDto) {
    const year = queryDto.year ? parseInt(queryDto.year, 10) : new Date().getFullYear();
    return this.revenueService.getMonthlyRevenue(year, this.TEST_TEACHER_ID);
  }
}