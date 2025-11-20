import http from './http';

export interface DashboardSummaryDto {
  totalEqpCount: number;
  onlineAgentCount: number;
  todayErrorCount: number;
  newAlarmCount: number;
}

export interface AgentStatusDto {
  eqpId: string;
  isOnline: boolean;
  lastContact: string | null;
  pcName: string;
  cpuUsage: number;
  memoryUsage: number;
  appVersion: string;
  type: string;
  ipAddress: string;
  os: string;
  systemType: string;
  locale: string;
  timezone: string;
  todayAlarmCount: number;
  clockDrift?: number | null;
}

export const dashboardApi = {
  getSites: async () => {
    const { data } = await http.get<string[]>('/Filters/sites');
    return data;
  },
  getSdwts: async (site: string) => {
    const { data } = await http.get<string[]>(`/Filters/sdwts/${encodeURIComponent(site)}`);
    return data;
  },
  getSummary: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await http.get<DashboardSummaryDto>('/dashboard/summary', { params });
    return data;
  },
  getAgentStatus: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await http.get<AgentStatusDto[]>('/dashboard/agentstatus', { params });
    return data;
  },
};
