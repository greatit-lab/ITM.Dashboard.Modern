// src/wafer/wafer.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

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
}

// 통계 쿼리 결과 인터페이스
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

@Injectable()
export class WaferService {
  constructor(private prisma: PrismaService) {}

  // 메인 그리드 데이터 조회
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

    // [수정] any 제거 및 정식 Prisma 타입 사용
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

    // [수정] as any 캐스팅 제거 (Prisma Client가 업데이트되어 타입 추론 가능)
    const [total, items] = await this.prisma.$transaction([
      this.prisma.plgWfFlat.count({ where }),
      this.prisma.plgWfFlat.findMany({
        where,
        take: Number(pageSize),
        skip: Number(page) * Number(pageSize),
        orderBy: { servTs: 'desc' },
        distinct: ['eqpid', 'servTs'],
        select: {
          eqpid: true,
          lotid: true,
          waferid: true,
          servTs: true,
          cassettercp: true,
          stagercp: true,
          stagegroup: true,
          film: true,
        },
      }),
    ]);

    return {
      totalItems: total,
      items: items.map((i) => ({
        eqpId: i.eqpid,
        lotId: i.lotid,
        waferId: i.waferid,
        servTs: i.servTs,
        cassetteRcp: i.cassettercp,
        stageRcp: i.stagercp,
        stageGroup: i.stagegroup,
        film: i.film,
      })),
    };
  }

  // 통계 데이터 조회
  async getStatistics(params: WaferQueryParams) {
    const whereSql = this.buildUniqueWhere(params);

    const result = await this.prisma.$queryRawUnsafe<StatsRawResult[]>(`
      SELECT
        MAX(t1) as t1_max, MIN(t1) as t1_min, AVG(t1) as t1_mean, STDDEV_SAMP(t1) as t1_std,
        MAX(gof) as gof_max, MIN(gof) as gof_min, AVG(gof) as gof_mean, STDDEV_SAMP(gof) as gof_std,
        MAX(z) as z_max, MIN(z) as z_min, AVG(z) as z_mean, STDDEV_SAMP(z) as z_std,
        MAX(srvisz) as s_max, MIN(srvisz) as s_min, AVG(srvisz) as s_mean, STDDEV_SAMP(srvisz) as s_std
      FROM public.plg_wf_flat
      ${whereSql}
    `);

    const row = result[0] || ({} as StatsRawResult);

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
  }

  // 포인트 데이터 조회
  async getPointData(
    params: WaferQueryParams,
  ): Promise<{ headers: string[]; data: unknown[][] }> {
    const whereSql = this.buildUniqueWhere(params);

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
    ]);

    const headers = Object.keys(rawData[0]).filter(
      (key) =>
        !excludeCols.has(key) && rawData.some((row) => row[key] !== null),
    );

    // [수정] any 대신 unknown 사용
    const data = rawData.map((row) => headers.map((h) => row[h]));

    return { headers, data };
  }

  // PDF 존재 여부
  async checkPdf(params: WaferQueryParams) {
    await Promise.resolve();
    if (!params.eqpId) return { exists: false, url: null };
    return { exists: false, url: null };
  }

  private buildUniqueWhere(p: WaferQueryParams) {
    if (!p.servTs) return 'WHERE 1=0';

    const dateObj =
      typeof p.servTs === 'string' ? new Date(p.servTs) : p.servTs;
    const t = dateObj.getTime();
    const tStart = new Date(t).toISOString();
    const tEnd = new Date(t + 1).toISOString(); // +1ms 범위 검색으로 정밀도 문제 해결

    return `WHERE eqpid = '${p.eqpId}' AND serv_ts >= '${tStart}' AND serv_ts < '${tEnd}'`;
  }
}
