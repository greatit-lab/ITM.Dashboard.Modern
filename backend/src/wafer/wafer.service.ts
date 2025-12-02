// backend/src/wafer/wafer.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path'; // path import는 파일 시스템 경로 구성에 필요합니다.

export class WaferQueryParams {
  eqpId?: string;
  lotId?: string;
  waferId?: string | number;
  startDate?: string | Date;
  endDate?: string | Date;
  cassetteRcp?: string;
  stageRcp?: string;
  stageGroup?: string;
  film?: string;
  page?: string | number;
  pageSize?: string | number;
  servTs?: string | Date;
  dateTime?: string | Date; // WaferController에서 추가됨
  pointNumber?: string | number; // WaferController에서 추가됨
}

interface StatsRawResult {
  t1_max: number | null;
  t1_min: number | null;
  t1_mean: number | null;
  t1_std: number | null;
  gof_max: number | null;
  gof_min: number | null;
  gof_mean: number | null;
  gof_std: number | null;
  z_max: number | null;
  z_min: number | null;
  z_mean: number | null;
  z_std: number | null;
  s_max: number | null;
  s_min: number | null;
  s_mean: number | null;
  s_std: number | null;
  [key: string]: number | null;
}

interface PdfResult {
  file_uri: string;
}

@Injectable()
export class WaferService {
  constructor(private prisma: PrismaService) {}

  async getFlatData(params: WaferQueryParams) {
    const {
      eqpId,
      lotId,
      waferId,
      startDate,
      endDate,
      cassetteRcp,
      stageRcp,
      stageGroup,
      film,
      page = 0,
      pageSize = 20,
    } = params;

    const where: Prisma.PlgWfFlatWhereInput = {
      eqpid: eqpId || undefined,
      servTs: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      lotid: lotId ? { contains: lotId, mode: 'insensitive' } : undefined,
      waferid: waferId ? Number(waferId) : undefined,
      cassettercp: cassetteRcp || undefined,
      stagercp: stageRcp || undefined,
      stagegroup: stageGroup || undefined,
      film: film || undefined,
    };

    // 1. Total Count (유니크 그룹 개수 계산)
    const uniqueGroupsPromise = this.prisma.plgWfFlat.groupBy({
      by: [
        'eqpid', 
        'servTs', 
        'lotid', 
        'waferid', 
        'cassettercp', 
        'stagercp', 
        'stagegroup', 
        'film',
      ],
      where,
      _count: {
        _all: true,
      },
    });

    // 2. Items 조회 (페이지네이션 적용)
    const itemsPromise = this.prisma.plgWfFlat.findMany({
      where,
      take: Number(pageSize),
      skip: Number(page) * Number(pageSize),
      // [최종 수정] 정렬 순서: 최신순(servTs desc) + WaferID 순서(waferid asc)
      orderBy: [
        { servTs: 'desc' }, 
        { waferid: 'asc' }, 
      ],
      // [최종 수정] DISTINCT 필드: datetime 제외
      distinct: [
        'eqpid',
        'servTs',
        'lotid',
        'waferid',
        'cassettercp',
        'stagercp',
        'stagegroup',
        'film',
      ],
      select: {
        eqpid: true,
        lotid: true,
        waferid: true,
        servTs: true,
        datetime: true, // EQP Time
        cassettercp: true,
        stagercp: true,
        stagegroup: true,
        film: true,
      },
    });

    const [uniqueGroups, items] = await this.prisma.$transaction([
      uniqueGroupsPromise,
      itemsPromise,
    ]);

    const total = uniqueGroups.length; // <-- 유니크 그룹의 개수를 최종 Total Count로 사용

    return {
      totalItems: total,
      items: items.map((i) => ({
        eqpId: i.eqpid,
        lotId: i.lotid,
        waferId: i.waferid,
        servTs: i.servTs,
        dateTime: i.datetime,
        cassetteRcp: i.cassettercp,
        stageRcp: i.stagercp,
        stageGroup: i.stagegroup,
        film: i.film,
      })),
    };
  }
  
  // ▼▼▼ [Wafer Map 로직] PDF 이미지 경로를 찾고 Base64 데이터를 반환하는 메서드 ▼▼▼
  async getPdfImage(params: WaferQueryParams): Promise<string> {
    const { eqpId, dateTime, pointNumber } = params;

    if (!eqpId || !dateTime) {
      throw new InternalServerErrorException('EQP ID and DateTime are required for PDF image.');
    }

    // 1. DB에서 file_uri 조회 (PDF 존재 여부 확인)
    // servTs 대신 dateTime을 사용합니다.
    const pdfCheckResult = await this.checkPdf({ eqpId, servTs: dateTime }); 
    if (!pdfCheckResult.exists || !pdfCheckResult.url) {
      throw new NotFoundException('PDF file URI not found in database.');
    }
    
    // 2. [핵심 로직] Base64 반환 (파일 시스템 목업)
    try {
        // [주의] 이 경로는 프로님의 실제 파일 구조에 맞게 수정해야 합니다.
        const dt = new Date(dateTime).toISOString();
        const datePart = dt.substring(0, 10).replace(/-/g, '');
        
        const mockFilePath = path.join(process.cwd(), 'wafer_maps', `${eqpId}_${datePart}_pt${pointNumber}.png`);

        const imageBuffer = fs.readFileSync(mockFilePath);
        return imageBuffer.toString('base64');
        
    } catch (e) {
        // ▼▼▼ [오류 수정] 'e.code' 접근 시 TypeScript 안전성 검사 통과를 위해 타입 단언 사용 ▼▼▼
        const error = e as { code?: string }; 
        
        // 파일 읽기 실패 (404)
        if (error.code === 'ENOENT') { 
            throw new NotFoundException(`Image file not found for point #${pointNumber}.`);
        }
        // 그 외 서버 오류
        console.error('PDF image processing failed:', e);
        throw new InternalServerErrorException('Server failed to read or process the image file.');
    }
  }

  async getStatistics(params: WaferQueryParams) {
    // buildUniqueWhere를 통해 stageGroup까지 포함된 정밀한 WHERE 절 생성
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return this.getEmptyStatistics();

    try {
      const result = await this.prisma.$queryRawUnsafe<StatsRawResult[]>(`
        SELECT
          MAX(t1) as t1_max, MIN(t1) as t1_min, AVG(t1) as t1_mean, STDDEV_SAMP(t1) as t1_std,
          MAX(gof) as gof_max, MIN(gof) as gof_min, AVG(gof) as gof_mean, STDDEV_SAMP(gof) as gof_std,
          MAX(z) as z_max, MIN(z) as z_min, AVG(z) as z_mean, STDDEV_SAMP(z) as z_std,
          MAX(srvisz) as s_max, MIN(srvisz) as s_min, AVG(srvisz) as s_mean, STDDEV_SAMP(srvisz) as s_std
        FROM public.plg_wf_flat
        ${whereSql}
        LIMIT 1
      `);

      const row = result[0] || ({} as StatsRawResult);

      if (row.t1_max === null) return this.getEmptyStatistics();

      const createStatItem = (prefix: string) => {
        const max = Number(row[`${prefix}_max`] || 0);
        const min = Number(row[`${prefix}_min`] || 0);
        const mean = Number(row[`${prefix}_mean`] || 0);
        const std = Number(row[`${prefix}_std`] || 0);
        const range = max - min;
        return {
          max,
          min,
          range,
          mean,
          stdDev: std,
          percentStdDev: mean !== 0 ? (std / mean) * 100 : 0,
          percentNonU: mean !== 0 ? (range / (2 * mean)) * 100 : 0,
        };
      };

      return {
        t1: createStatItem('t1'),
        gof: createStatItem('gof'),
        z: createStatItem('z'),
        srvisz: createStatItem('s'),
      };
    } catch (e) {
      console.error('Error in getStatistics:', e);
      return this.getEmptyStatistics();
    }
  }

  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    // buildUniqueWhere를 통해 stageGroup, film 조건이 포함된 WHERE 절 생성
    const whereSql = this.buildUniqueWhere(params);
    if (!whereSql) return { headers: [], data: [] };

    try {
      // 포인트 데이터 조회 시에도 stageGroup 조건이 적용되어 중복 데이터가 제거됨
      const rawData = await this.prisma.$queryRawUnsafe<
        Record<string, unknown>[]
      >(`
        SELECT * FROM public.plg_wf_flat ${whereSql} ORDER BY point
      `);

      if (!rawData || rawData.length === 0) return { headers: [], data: [] };

      const excludeCols = new Set([
        'eqpid',
        'lotid',
        'waferid',
        'serv_ts',
        'cassettercp',
        'stagercp',
        'stagegroup',
        'film',
        'datetime',
      ]);

      const allKeys = new Set<string>();
      rawData.forEach((row) => {
        Object.keys(row).forEach((k) => {
          if (!excludeCols.has(k) && row[k] !== null) allKeys.add(k);
        });
      });

      // [수정] 사용자 지정 순서 정렬 로직 적용
      const customOrder = [
        'point',
        'mse',
        't1',
        'gof',
        'x',
        'y',
        'diex',
        'diey',
        'dierow',
        'diecol',
        'dienum',
        'diepointtag',
        'z',
        'srvisz',
      ];

      const headers = Array.from(allKeys).sort((a, b) => {
        const lowerA = a.toLowerCase();
        const lowerB = b.toLowerCase();
        const idxA = customOrder.indexOf(lowerA);
        const idxB = customOrder.indexOf(lowerB);

        // 둘 다 지정된 순서에 있으면 인덱스 비교
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        // 하나만 있으면 지정된 것을 앞으로
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        // 둘 다 없으면 알파벳 순
        return lowerA.localeCompare(lowerB);
      });

      const data = rawData.map((row) => headers.map((h) => row[h]));

      return { headers, data };
    } catch (e) {
      console.error('Error in getPointData:', e);
      return { headers: [], data: [] };
    }
  }

  async checkPdf(params: WaferQueryParams) {
    const { eqpId, servTs } = params;

    if (!eqpId || !servTs) {
      return { exists: false, url: null };
    }

    try {
      const ts = typeof servTs === 'string' ? servTs : servTs.toISOString();

      const result = await this.prisma.$queryRawUnsafe<PdfResult[]>(
        `SELECT file_uri FROM public.plg_wf_map 
         WHERE eqpid = $1 
           AND datetime >= $2::timestamp - interval '24 hours'
           AND datetime <= $2::timestamp + interval '24 hours'
         LIMIT 1`,
        eqpId,
        ts,
      );

      if (result && result.length > 0 && result[0].file_uri) {
        return { exists: true, url: result[0].file_uri };
      }
    } catch (e) {
      console.warn(`Failed to check PDF for ${eqpId}:`, e);
    }

    return { exists: false, url: null };
  }

  // 유니크한 행 식별을 위해 stageGroup과 film 조건 추가
  private buildUniqueWhere(p: WaferQueryParams): string | null {
    if (!p.eqpId) return null;

    let sql = `WHERE eqpid = '${p.eqpId}'`;

    if (p.servTs) {
      const ts =
        typeof p.servTs === 'string' ? p.servTs : p.servTs.toISOString();
      sql += ` AND serv_ts >= '${ts}'::timestamp - interval '24 hours'`;
      sql += ` AND serv_ts <= '${ts}'::timestamp + interval '24 hours'`;
    }

    if (p.lotId) sql += ` AND lotid = '${p.lotId}'`;
    if (p.waferId) sql += ` AND waferid = ${p.waferId}`;
    if (p.cassetteRcp) sql += ` AND cassettercp = '${p.cassetteRcp}'`;
    if (p.stageRcp) sql += ` AND stagercp = '${p.stageRcp}'`;

    if (p.stageGroup) sql += ` AND stagegroup = '${p.stageGroup}'`;
    if (p.film) sql += ` AND film = '${p.film}'`;

    return sql;
  }

  private getEmptyStatistics() {
    const emptyItem = {
      max: 0,
      min: 0,
      range: 0,
      mean: 0,
      stdDev: 0,
      percentStdDev: 0,
      percentNonU: 0,
    };
    return { t1: emptyItem, gof: emptyItem, z: emptyItem, srvisz: emptyItem };
  }
}
