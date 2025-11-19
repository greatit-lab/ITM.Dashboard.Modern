import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
});

export interface ErrorAnalyticsSummaryDto {
  totalErrorCount: number;
  errorEqpCount: number;
  topErrorId: string;
  topErrorCount: number;
  topErrorLabel: string;
  errorCountByEqp: { label: string; value: number }[];
}

export interface ErrorTrendDataPointDto {
  date: string;
  count: number;
}

export interface ErrorLogDto {
  timeStamp: string;
  eqpId: string;
  errorId: string;
  errorLabel: string;
  errorDesc: string;
  extraMessage1: string;
  extraMessage2: string;
}

export const errorApi = {
  getSummary: async (params: any) => {
    const { data } = await apiClient.get<ErrorAnalyticsSummaryDto>(
      "/ErrorAnalytics/summary",
      { params }
    );
    return data;
  },
  getTrend: async (params: any) => {
    const { data } = await apiClient.get<ErrorTrendDataPointDto[]>(
      "/ErrorAnalytics/trend",
      { params }
    );
    return data;
  },
  getLogs: async (params: any) => {
    const { data } = await apiClient.get<{
      items: ErrorLogDto[];
      totalItems: number;
    }>("/ErrorAnalytics/logs", { params });
    return data;
  },
};
