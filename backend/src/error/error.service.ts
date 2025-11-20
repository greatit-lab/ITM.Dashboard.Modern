import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ErrorService {
  constructor(private prisma: PrismaService) {}

  // 공통 WHERE 절 생성기 (C# BuildFilteredQuery 대응)
  private buildWhereClause(startDate: string, endDate: string, site?: string, sdwt?: string, eqpId?: string) {
    let sql = `FROM public.plg_error e WHERE e.serv_ts >= '${startDate}' AND e.serv_ts < '${endDate}'`;
    
    if (eqpId) {
      sql += ` AND e.eqpid = '${eqpId}'`;
    } else if (sdwt) {
      sql += ` AND e.eqpid IN (SELECT eqpid FROM public.ref_equipment WHERE sdwt = '${sdwt}')`;
    } else if (site) {
      sql += ` AND e.eqpid IN (SELECT r.eqpid FROM public.ref_equipment r JOIN public.ref_sdwt s ON r.sdwt = s.sdwt WHERE s.site = '${site}')`;
    }
    return sql;
  }

  async getSummary(params: any) {
    const { startDate, endDate, site, sdwt, eqpids } = params;
    const where = this.buildWhereClause(startDate, endDate, site, sdwt, eqpids);

    // 1. 전체 에러 수
    const totalRes = await this.prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*)::int as count ${where}`);
    
    // 2. 에러 발생 장비 수
    const eqpRes = await this.prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(DISTINCT e.eqpid)::int as count ${where}`);

    // 3. 최다 발생 에러
    const topRes = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT e.error_id, e.error_label, COUNT(*)::int as count 
      ${where} 
      GROUP BY e.error_id, e.error_label 
      ORDER BY count DESC LIMIT 1
    `);

    // 4. 장비별 발생 건수
    const byEqpRes = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT e.eqpid as label, COUNT(*)::int as value 
      ${where} 
      GROUP BY e.eqpid 
      ORDER BY value DESC
    `);

    return {
      totalErrorCount: totalRes[0]?.count || 0,
      errorEqpCount: eqpRes[0]?.count || 0,
      topErrorId: topRes[0]?.error_id || 'N/A',
      topErrorCount: topRes[0]?.count || 0,
      topErrorLabel: topRes[0]?.error_label || '',
      errorCountByEqp: byEqpRes.map(r => ({ label: r.label, value: Number(r.value) }))
    };
  }

  async getTrend(params: any) {
    const { startDate, endDate, site, sdwt, eqpids } = params;
    const where = this.buildWhereClause(startDate, endDate, site, sdwt, eqpids);
    
    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT DATE_TRUNC('day', e.serv_ts) as date, COUNT(*)::int as count 
      ${where} 
      GROUP BY date 
      ORDER BY date
    `);
    
    return result.map(r => ({ date: r.date, count: Number(r.count) }));
  }

  async getLogs(params: any) {
    const { startDate, endDate, site, sdwt, eqpids, page = 0, pageSize = 10 } = params;
    const where = this.buildWhereClause(startDate, endDate, site, sdwt, eqpids);
    const offset = page * pageSize;

    const countRes = await this.prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*)::int as total ${where}`);
    const dataRes = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT e.serv_ts, e.eqpid, e.error_id, e.error_label, e.error_desc, e.extra_message_1, e.extra_message_2
      ${where}
      ORDER BY e.serv_ts DESC
      OFFSET ${offset} LIMIT ${pageSize}
    `);

    return {
      items: dataRes.map(r => ({
        timeStamp: r.serv_ts,
        eqpId: r.eqpid,
        errorId: r.error_id,
        errorLabel: r.error_label,
        errorDesc: r.error_desc,
        extraMessage1: r.extra_message_1,
        extraMessage2: r.extra_message_2
      })),
      totalItems: countRes[0]?.total || 0
    };
  }
}
