// frontend/src/api/wafer.ts
import axios from "axios";

// [수정] 백엔드 포트 3000번으로 설정
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// --- DTO 정의 ---

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

// 기존 스펙트럼 데이터 DTO (개별 포인트 상세 조회용)
export interface SpectrumDto {
  class: string; // 'exp' | 'gen'
  wavelengths: number[];
  values: number[];
}

// [신규] 시뮬레이션 정합성(Residual) 맵 DTO
export interface ResidualMapDto {
  point: number;
  x: number;
  y: number;
  residual: number; // EXP와 GEN의 차이 총합
}

// [신규] Golden Spectrum (기준 파형) DTO
export interface GoldenSpectrumDto {
  wavelengths: number[];
  values: number[];
}

// --- API 함수 ---

export const waferApi = {
  // 1. 필터 데이터 조회 (Lot, Wafer, Recipe 목록 등)
  getDistinctValues: async (field: string, params: any) => {
    const { data } = await apiClient.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  // 2. 메인 그리드 데이터 조회 (Wafer 목록)
  getFlatData: async (params: any) => {
    const { data } = await apiClient.get<{
      items: WaferFlatDataDto[];
      totalItems: number;
    }>("/WaferData/flatdata", { params });
    return data;
  },

  // 3. 통계 데이터 조회
  getStatistics: async (params: any) => {
    const { data } = await apiClient.get<StatisticsDto>(
      "/WaferData/statistics",
      {
        params,
      }
    );
    return data;
  },

  // 4. 포인트 데이터 조회 (Raw Data Table)
  getPointData: async (params: any) => {
    const { data } = await apiClient.get<PointDataResponseDto>(
      "/WaferData/pointdata",
      { params }
    );
    return data;
  },

  // 5. PDF 존재 여부 확인
  checkPdf: async (eqpId: string, servTs: string) => {
    const dt =
      typeof servTs === "string"
        ? servTs
        : (servTs as unknown as Date).toISOString();

    const { data } = await apiClient.get<{ exists: boolean }>(
      "/WaferData/checkpdf",
      { params: { eqpId, servTs: dt } }
    );
    return data.exists;
  },

  // 6. PDF 이미지 Base64 데이터 요청
  getPdfImageBase64: async (
    eqpId: string,
    dateTime: string,
    pointNumber: number
  ) => {
    const dt =
      typeof dateTime === "string"
        ? dateTime
        : (dateTime as unknown as Date).toISOString();

    const params = {
      eqpId,
      dateTime: dt,
      pointNumber,
    };

    const { data } = await apiClient.get<string>("/WaferData/pdfimage", {
      params,
    });

    return data;
  },

  // 7. 특정 포인트의 Spectrum 데이터 조회 (EXP/GEN 포함)
  getSpectrum: async (params: any) => {
    const { data } = await apiClient.get<SpectrumDto[]>("/WaferData/spectrum", {
      params,
    });
    return data;
  },

  // [신규] 8. 시뮬레이션 정합성 분석 (Residual Map) 데이터 조회
  getResidualMap: async (params: any) => {
    const { data } = await apiClient.get<ResidualMapDto[]>(
      "/WaferData/residual-map",
      { params }
    );
    return data;
  },

  // [신규] 9. 공정 Fingerprint (Golden Spectrum) 데이터 조회
  getGoldenSpectrum: async (params: any) => {
    // Golden Spectrum이 없을 경우(null)를 대비
    const { data } = await apiClient.get<GoldenSpectrumDto | null>(
      "/WaferData/golden-spectrum",
      { params }
    );
    return data;
  },
};
