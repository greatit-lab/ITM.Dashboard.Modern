import axios from "axios";
const apiClient = axios.create({ baseURL: "http://localhost:3000/api" });

export interface LampLifeDto {
  eqpId: string;
  lampId: string;
  ageHour: number;
  lifespanHour: number;
  lastChanged: string | null;
  ts: string;
  // usedLifePercentage는 프론트엔드에서 계산
}

export const lampApi = {
  getData: async (site: string, sdwt?: string, eqpId?: string) => {
    const params = { site, sdwt, eqpId };
    const { data } = await apiClient.get<LampLifeDto[]>("/LampLife", {
      params,
    });
    return data;
  },
};
