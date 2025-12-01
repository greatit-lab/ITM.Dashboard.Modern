// backend/src/filters/filters.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersService, FilterQueryDto } from './filters.service'; // [수정] DTO import 추가

@Controller('api/Filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Get('sites')
  getSites() {
    return this.filtersService.getSites();
  }

  @Get('sdwts/:site')
  getSdwts(@Param('site') site: string) {
    return this.filtersService.getSdwts(site);
  }

  // ▼▼▼ [수정] 모든 메서드의 @Query() 타입을 FilterQueryDto로 변경 ▼▼▼

  @Get('lotids')
  getLotIds(@Query() query: FilterQueryDto) {
    return this.filtersService.getFilteredDistinctValues('lotid', query);
  }

  @Get('waferids')
  getWaferIds(@Query() query: FilterQueryDto) {
    return this.filtersService.getFilteredDistinctValues('waferid', query);
  }

  @Get('cassettercps')
  getCassetteRcps(@Query() query: FilterQueryDto) {
    return this.filtersService.getFilteredDistinctValues('cassettercp', query);
  }

  @Get('stagercps')
  getStageRcps(@Query() query: FilterQueryDto) {
    return this.filtersService.getFilteredDistinctValues('stagercp', query);
  }

  @Get('stagegroups')
  getStageGroups(@Query() query: FilterQueryDto) {
    return this.filtersService.getFilteredDistinctValues('stagegroup', query);
  }

  @Get('films')
  getFilms(@Query() query: FilterQueryDto) {
    return this.filtersService.getFilteredDistinctValues('film', query);
  }
}
