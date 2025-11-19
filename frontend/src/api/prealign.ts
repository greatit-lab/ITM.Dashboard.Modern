import axios from "axios";
const apiClient = axios.create({ baseURL: "http://localhost:3000/api" });

export interface PreAlignDataDto {
  timestamp: string;
  xmm: number;
  ymm: number;
  notch: number;
}

export const preAlignApi = {
  getData: async (eqpId: string, startDate: string, endDate: string) => {
    const params = { eqpid: eqpId, startDate, endDate };
    const { data } = await apiClient.get<PreAlignDataDto[]>(
      "/PreAlignAnalytics/data",
      { params }
    );
    return data;
  },
};
