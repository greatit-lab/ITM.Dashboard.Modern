// frontend/src/stores/filter.ts
import { defineStore } from "pinia";
import { ref } from "vue";

export const useFilterStore = defineStore("filter", () => {
  // 전역 상태 (새로고침해도 유지되도록 localStorage 연동 가능)
  const selectedSite = ref<string>("");
  const selectedSdwt = ref<string>("");

  // 기본 날짜 범위: 최근 24시간
  const startDate = ref<Date>(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const endDate = ref<Date>(new Date());

  // Actions
  function setSite(site: string) {
    selectedSite.value = site;
    selectedSdwt.value = ""; // Site 변경 시 SDWT 초기화
  }

  function setSdwt(sdwt: string) {
    selectedSdwt.value = sdwt;
  }

  function setDateRange(start: Date, end: Date) {
    startDate.value = start;
    endDate.value = end;
  }

  function reset() {
    selectedSite.value = "";
    selectedSdwt.value = "";
    startDate.value = new Date(Date.now() - 24 * 60 * 60 * 1000);
    endDate.value = new Date();
  }

  return {
    selectedSite,
    selectedSdwt,
    startDate,
    endDate,
    setSite,
    setSdwt,
    setDateRange,
    reset,
  };
});
