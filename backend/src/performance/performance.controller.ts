import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from './performance.service';

@Controller('api/PerformanceAnalytics')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('history')
  getHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpids') eqpids: string,
    @Query('intervalSeconds') intervalSeconds: string
  ) {
    return this.performanceService.getHistory(startDate, endDate, eqpids, Number(intervalSeconds));
  }

  @Get('process-history')
  getProcessHistory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('eqpid') eqpId: string
  ) {
    return this.performanceService.getProcessHistory(startDate, endDate, eqpId);
  }
}
