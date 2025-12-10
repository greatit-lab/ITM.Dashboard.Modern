// backend/src/filters/filters.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export class FilterQueryDto {
  eqpId?: string;
  startDate?: string;
  endDate?: string;
  lotId?: string;
  waferId?: string;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
}

@Injectable()
export class FiltersService {
  constructor(private prisma: PrismaService) {}

  async getSites(): Promise<string[]> {
    try {
      const results = await this.prisma.$queryRaw<{ site: string }[]>`
        SELECT DISTINCT site FROM public.ref_sdwt WHERE is_use = 'Y' ORDER BY site;
      `;
      return results.map((r) => r.site);
    } catch (e) {
      console.error('Error fetching sites:', e);
      return [];
    }
  }

  async getSdwts(site: string): Promise<string[]> {
    try {
      const results = await this.prisma.$queryRaw<{ sdwt: string }[]>`
        SELECT DISTINCT sdwt FROM public.ref_sdwt WHERE site = ${site} AND is_use = 'Y' ORDER BY sdwt;
      `;
      return results.map((r) => r.sdwt);
    } catch (e) {
      console.error(`Error fetching sdwts for site ${site}:`, e);
      return [];
    }
  }

  // [신규] 페이지별 데이터 소스에 따른 EQP ID 조회
  async getEqpIdsBySource(
    site: string | undefined,
    sdwt: string | undefined,
    type: string,
  ): Promise<string[]> {
    const tableMap: Record<string, string> = {
      wafer: 'public.plg_wf_flat',
      performance: 'public.eqp_perf',
      process: 'public.eqp_proc_perf',
      error: 'public.plg_error',
      prealign: 'public.plg_prealign',
      lamplife: 'public.eqp_lamp_life',
      agent: 'public.agent_info',
    };

    const sourceTable = tableMap[type];

    if (!sourceTable) {
      return this.getAllEqpIds(site, sdwt);
    }

    let sql = `
      SELECT DISTINCT T1.eqpid
      FROM public.ref_equipment AS T1
      INNER JOIN ${sourceTable} AS T2 ON T1.eqpid = T2.eqpid
      INNER JOIN public.ref_sdwt AS T3 ON T1.sdwt = T3.sdwt
      WHERE T3.is_use = 'Y'
    `;

    const params: string[] = [];
    let paramIdx = 1;

    if (sdwt) {
      sql += ` AND T1.sdwt = $${paramIdx++}`;
      params.push(sdwt);
    } else if (site) {
      sql += ` AND T3.site = $${paramIdx++}`;
      params.push(site);
    }

    sql += ` ORDER BY T1.eqpid`;

    try {
      const results = await this.prisma.$queryRawUnsafe<{ eqpid: string }[]>(
        sql,
        ...params,
      );
      return results.map((r) => r.eqpid);
    } catch (e) {
      console.error(`Error fetching eqpids for type ${type}:`, e);
      return [];
    }
  }

  // [보조] 기존의 모든 장비 조회 (Fallback용)
  private async getAllEqpIds(site?: string, sdwt?: string): Promise<string[]> {
    let sql = `
      SELECT DISTINCT r.eqpid 
      FROM public.ref_equipment r
      JOIN public.ref_sdwt s ON r.sdwt = s.sdwt
      WHERE s.is_use = 'Y'
    `;
    const params: string[] = [];
    let idx = 1;

    if (sdwt) {
      sql += ` AND r.sdwt = $${idx++}`;
      params.push(sdwt);
    } else if (site) {
      sql += ` AND s.site = $${idx++}`;
      params.push(site);
    }
    sql += ` ORDER BY r.eqpid`;

    try {
      const results = await this.prisma.$queryRawUnsafe<{ eqpid: string }[]>(
        sql,
        ...params,
      );
      return results.map((r) => r.eqpid);
    } catch (e) {
      // [수정] 에러 변수 'e' 사용 (로그 출력)
      console.error('Error fetching all eqpids:', e);
      return [];
    }
  }

  async getFilteredDistinctValues(
    field: string,
    query: FilterQueryDto,
  ): Promise<string[]> {
    const {
      eqpId,
      startDate,
      endDate,
      lotId,
      waferId,
      cassetteRcp,
      stageRcp,
      stageGroup,
      film,
    } = query;
    const columnMap: Record<string, string> = {
      lotids: 'lotid',
      waferids: 'waferid',
      cassettercps: 'cassettercp',
      stagercps: 'stagercp',
      stagegroups: 'stagegroup',
      films: 'film',
      lotid: 'lotid',
      waferid: 'waferid',
      cassettercp: 'cassettercp',
      stagercp: 'stagercp',
      stagegroup: 'stagegroup',
      film: 'film',
    };
    const targetColumn = columnMap[field.toLowerCase()] || field;
    const allowedColumns = [
      'lotid',
      'waferid',
      'cassettercp',
      'stagercp',
      'stagegroup',
      'film',
    ];

    if (!allowedColumns.includes(targetColumn)) return [];

    let sql = `SELECT DISTINCT "${targetColumn}" FROM public.plg_wf_flat WHERE "${targetColumn}" IS NOT NULL`;
    const params: (string | number | Date)[] = [];
    let paramIndex = 1;

    if (eqpId) {
      sql += ` AND eqpid = $${paramIndex++}`;
      params.push(eqpId);
    }
    if (startDate) {
      sql += ` AND serv_ts >= $${paramIndex++}`;
      params.push(new Date(startDate));
    }
    if (endDate) {
      sql += ` AND serv_ts <= $${paramIndex++}`;
      params.push(new Date(endDate));
    }

    const addCondition = (val: string | undefined, col: string) => {
      if (val && col !== targetColumn) {
        sql += ` AND "${col}" = $${paramIndex++}`;
        params.push(col === 'waferid' ? Number(val) : val);
      }
    };

    addCondition(lotId, 'lotid');
    addCondition(waferId, 'waferid');
    addCondition(cassetteRcp, 'cassettercp');
    addCondition(stageRcp, 'stagercp');
    addCondition(stageGroup, 'stagegroup');
    addCondition(film, 'film');

    sql += ` ORDER BY "${targetColumn}" ASC LIMIT 500`;

    try {
      const results = await this.prisma.$queryRawUnsafe<
        Record<string, unknown>[]
      >(sql, ...params);
      return results
        .map((r) => r[targetColumn])
        .filter(
          (v): v is string | number =>
            v !== null && v !== '' && v !== undefined,
        )
        .map((v) => String(v));
    } catch (e) {
      // [수정] 에러 변수 'e' 사용 (로그 출력)
      console.error(`Error fetching distinct values for ${targetColumn}:`, e);
      return [];
    }
  }
}
