import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FiltersService {
  constructor(private prisma: PrismaService) {}

  async getSites() {
    const results = await this.prisma.$queryRaw<{ site: string }[]>`
      SELECT DISTINCT site FROM public.ref_sdwt WHERE is_use = 'Y' ORDER BY site;
    `;
    return results.map(r => r.site);
  }

  async getSdwts(site: string) {
    // Prisma.sql을 사용하여 SQL Injection 방지
    const results = await this.prisma.$queryRaw<{ sdwt: string }[]>`
      SELECT DISTINCT sdwt FROM public.ref_sdwt WHERE site = ${site} AND is_use = 'Y' ORDER BY sdwt;
    `;
    return results.map(r => r.sdwt);
  }
  
  // ... (필요시 EqpID 조회 로직 추가)
}
