import { Controller, Get, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('api/Equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get('details')
  getDetails(@Query('site') site: string, @Query('sdwt') sdwt: string, @Query('eqpid') eqpid: string) {
    return this.equipmentService.getDetails(site, sdwt, eqpid);
  }

  @Get('eqpids')
  getEqpIds(@Query('site') site: string, @Query('sdwt') sdwt: string) {
    return this.equipmentService.getEqpIds(site, sdwt);
  }
}
