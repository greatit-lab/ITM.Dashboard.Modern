import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// DTO 정의
export interface WaferFlatDataDto {
  eqpId: string;
  lotId: string;
  waferId: number;
  servTs: string;
  dateTime: string;
  cassetteRcp: string;
  stageRcp: string;
  stageGroup: string;
  film: string;
}

export interface StatisticsDto {
  t1: StatisticItem;
  gof: StatisticItem;
  z: StatisticItem;
  srvisz: StatisticItem;
}

export interface StatisticItem {
  max: number;
  min: number;
  range: number;
  mean: number;
  stdDev: number;
  percentStdDev: number;
  percentNonU: number;
}

export interface PointDataResponseDto {
  headers: string[];
  data: any[][];
}

// API 함수
export const waferApi = {
  // 필터 데이터 조회
  getDistinctValues: async (field: string, params: any) => {
    const { data } = await apiClient.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  // 메인 그리드 데이터 조회
  getFlatData: async (params: any) => {
    const { data } = await apiClient.get<{
      items: WaferFlatDataDto[];
      totalItems: number;
    }>("/WaferData/flatdata", { params });
    return data;
  },

  // 통계 데이터 조회
  getStatistics: async (params: any) => {
    const { data } = await apiClient.get<StatisticsDto>("/Statistics", {
      params,
    });
    return data;
  },

  // 포인트 데이터 조회
  getPointData: async (params: any) => {
    const { data } = await apiClient.get<PointDataResponseDto>(
      "/WaferData/pointdata",
      { params }
    );
    return data;
  },

  // PDF 존재 여부 확인
  checkPdf: async (eqpId: string, dateTime: string) => {
    const { data } = await apiClient.get<{ exists: boolean }>(
      "/WaferData/checkpdf",
      { params: { eqpId, dateTime } }
    );
    return data.exists;
  },

  // PDF 이미지 URL 생성 (img src용)
  getPdfImageUrl: (eqpId: string, dateTime: string, pointNumber: number) => {
    return `http://localhost:3000/api/WaferData/pdfimage?eqpid=${encodeURIComponent(
      eqpId
    )}&dateTime=${dateTime}&pointNumber=${pointNumber}`;
  },
};
