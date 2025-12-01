// backend/src/app.module.ts
import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm'; // [삭제]
import { PrismaService } from './prisma.service';

// Modules
import { EquipmentModule } from './equipment/equipment.module';

// Controllers & Services
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
    // [삭제] TypeOrmModule.forRoot(...) 블록 전체 삭제
    // PrismaService가 DB 연결을 전담하므로 TypeORM은 필요 없습니다.

    EquipmentModule, // 내부에서 PrismaService를 사용하도록 변경됨
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
