import axios from "axios";

// Axios 인스턴스 생성 (기본 설정)
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // NestJS 백엔드 주소
  headers: { "Content-Type": "application/json" },
});

// --- DTO 인터페이스 정의 (C# 모델과 1:1 매핑) ---

export interface DashboardSummaryDto {
  totalEqpCount: number;
  onlineAgentCount: number;
  todayErrorCount: number;
  todayDataCount: number;
  newAlarmCount: number;
}

export interface AgentStatusDto {
  eqpId: string;
  isOnline: boolean;
  lastContact: string | null; // DateTime은 string으로 처리
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

// --- API 호출 함수 ---

export const dashboardApi = {
  // 필터용 Site 목록 조회
  getSites: async () => {
    const { data } = await apiClient.get<string[]>("/Filters/sites");
    return data;
  },

  // 필터용 SDWT 목록 조회
  getSdwts: async (site: string) => {
    const { data } = await apiClient.get<string[]>(`/Filters/sdwts/${site}`);
    return data;
  },

  // 대시보드 요약 카드 데이터 조회
  getSummary: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await apiClient.get<DashboardSummaryDto>(
      "/dashboard/summary",
      { params }
    );
    return data;
  },

  // 에이전트 상태 목록 조회
  getAgentStatus: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await apiClient.get<AgentStatusDto[]>(
      "/dashboard/agentstatus",
      { params }
    );
    return data;
  },
};
