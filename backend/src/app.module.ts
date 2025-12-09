// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Modules
import { EquipmentModule } from './equipment/equipment.module';
import { PreAlignModule } from './prealign/prealign.module';
import { LampLifeModule } from './lamplife/lamplife.module';

// Controllers & Services (기존 유지)
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { PerformanceController } from './performance/performance.controller';
import { PerformanceService } from './performance/performance.service';
import { ErrorController } from './error/error.controller';
import { ErrorService } from './error/error.service';
import { FiltersController } from './filters/filters.controller';
import { FiltersService } from './filters/filters.service';
import { WaferController } from './wafer/wafer.controller';
import { WaferService } from './wafer/wafer.service';

@Module({
  imports: [
    EquipmentModule,
    PreAlignModule,
    LampLifeModule,
  ],
  controllers: [
    DashboardController,
    PerformanceController,
    ErrorController,
    FiltersController,
    WaferController,
  ],
  providers: [
    PrismaService,
    DashboardService,
    PerformanceService,
    ErrorService,
    FiltersService,
    WaferService,
  ],
})
export class AppModule {}
