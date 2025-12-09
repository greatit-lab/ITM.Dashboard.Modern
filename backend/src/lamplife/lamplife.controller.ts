// backend/src/lamplife/lamplife.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { LampLifeService } from './lamplife.service';

// 이 컨트롤러만 명시적으로 'api/LampLife' 경로를 사용
@Controller('api/LampLife')
export class LampLifeController {
  constructor(private readonly lampLifeService: LampLifeService) {}

  @Get()
  async getLampStatus(
    @Query('site') site: string,
    @Query('sdwt') sdwt?: string,
  ) {
    return this.lampLifeService.getLampStatus(site, sdwt);
  }
}
