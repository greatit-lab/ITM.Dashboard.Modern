import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
});

// DTO 인터페이스 정의
export interface PerformanceDataPointDto {
  eqpId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  cpuTemp: number;
  gpuTemp: number;
  fanSpeed: number;
}

export interface ProcessMemoryDataDto {
  timestamp: string;
  processName: string;
  memoryUsageMB: number;
}

// API 호출 객체
export const performanceApi = {
  // Performance Trend 차트 데이터
  getHistory: async (
    startDate: string,
    endDate: string,
    eqpids: string,
    intervalSeconds: number
  ) => {
    const params = { startDate, endDate, eqpids, intervalSeconds };
    const { data } = await apiClient.get<PerformanceDataPointDto[]>(
      "/PerformanceAnalytics/history",
      { params }
    );
    return data;
  },

  // [누락되었던 부분 추가] Process Memory 데이터
  getProcessHistory: async (
    startDate: string,
    endDate: string,
    eqpId: string
  ) => {
    const params = { startDate, endDate, eqpid: eqpId };
    const { data } = await apiClient.get<ProcessMemoryDataDto[]>(
      "/PerformanceAnalytics/process-history",
      { params }
    );
    return data;
  },
};
