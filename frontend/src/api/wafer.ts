// frontend/src/api/wafer.ts
import axios from "axios";

// 백엔드 포트 3000번으로 설정
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

export interface SpectrumDto {
  class: string;
  wavelengths: number[];
  values: number[];
}

export interface ResidualMapDto {
  point: number;
  x: number;
  y: number;
  residual: number;
}

export interface GoldenSpectrumDto {
  wavelengths: number[];
  values: number[];
}

export interface LotUniformitySeriesDto {
  waferId: number;
  dataPoints: {
    point: number;
    value: number;
    x: number;
    y: number;
    dieRow?: number;
    dieCol?: number;
  }[];
}

// [추가됨] Spectrum Trend 분석용 DTO
export interface SpectrumSeriesDto {
  name: string;
  waferId: number;
  pointId: number;
  data: [number, number][]; // [wavelength, intensity]
}

// --- API 함수 ---

export const waferApi = {
  // 1. 필터 값 조회
  getDistinctValues: async (field: string, params: any) => {
    // 기존 URL 유지 (/Filters/...)
    const { data } = await apiClient.get<string[]>(`/Filters/${field}`, {
      params,
    });
    return data;
  },

  // 2. Flat Data 조회
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

  // 4. 포인트 데이터 조회
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

  // 6. PDF 이미지 Base64 변환 조회
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

  // 7. 단일 스펙트럼 조회
  getSpectrum: async (params: any) => {
    const { data } = await apiClient.get<SpectrumDto[]>("/WaferData/spectrum", {
      params,
    });
    return data;
  },

  // 8. Residual Map 조회
  getResidualMap: async (params: any) => {
    const { data } = await apiClient.get<ResidualMapDto[]>(
      "/WaferData/residual-map",
      { params }
    );
    return data;
  },

  // 9. Golden Spectrum 조회
  getGoldenSpectrum: async (params: any) => {
    const { data } = await apiClient.get<GoldenSpectrumDto | null>(
      "/WaferData/golden-spectrum",
      { params }
    );
    return data;
  },

  // 10. 사용 가능한 Metric 조회
  getAvailableMetrics: async (params: any) => {
    const { data } = await apiClient.get<string[]>("/WaferData/metrics", {
      params,
    });
    return data;
  },

  // 11. Lot Uniformity Trend 조회
  getLotUniformityTrend: async (params: any) => {
    const { data } = await apiClient.get<LotUniformitySeriesDto[]>(
      "/WaferData/trend",
      { params }
    );
    return data;
  },

  // [추가됨] 12. Spectrum Analysis Trend 조회
  getSpectrumTrend: async (params: any) => {
    // Backend Controller에 @Get('trend/spectrum') 엔드포인트가 있어야 함
    // params: { lotId, pointId, waferIds }
    const { data } = await apiClient.get<SpectrumSeriesDto[]>(
      "/WaferData/trend/spectrum",
      { params }
    );
    return data;
  },
};
