import { Module } from '@nestjs/common';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import { RevenueCronService } from './revenue-cron.service'; // Import thêm dòng này
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [RevenueController],
  providers: [RevenueService, RevenueCronService], // Khai báo Cron Bot ở đây
})
export class RevenueModule {}