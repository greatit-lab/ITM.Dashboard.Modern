import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
});

// DTO 정의
export interface EquipmentSpecDto {
  eqpId: string;
  type: string;
  pcName: string;
  isOnline: boolean;
  ipAddress: string;
  macAddress: string;
  os: string;
  systemType: string;
  locale: string;
  timezone: string;
  cpu: string;
  memory: string;
  disk: string;
  vga: string;
  lastContact: string | null;
  systemModel: string;
  serialNum: string;
  application: string;
  version: string;
  dbVersion: string;
}

export const equipmentApi = {
  // 장비 ID 목록 조회 (필터용)
  getEqpIds: async (site?: string, sdwt?: string) => {
    const params = { site, sdwt };
    const { data } = await apiClient.get<string[]>("/Equipment/eqpids", {
      params,
    });
    return data;
  },

  // 장비 상세 정보 조회
  getDetails: async (site?: string, sdwt?: string, eqpId?: string) => {
    const params = { site, sdwt, eqpId };
    const { data } = await apiClient.get<EquipmentSpecDto[]>(
      "/Equipment/details",
      { params }
    );
    return data;
  },
};
