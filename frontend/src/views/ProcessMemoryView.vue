<!-- frontend/src/views/ProcessMemoryView.vue -->
<template>
  <div
    class="min-h-full transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B] font-sans flex flex-col"
  >
    <div class="flex items-center justify-between gap-3 px-1 mb-2 shrink-0">
      <div class="flex items-center gap-2">
        <div
          class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
        >
          <i
            class="text-lg text-purple-600 pi pi-microchip dark:text-purple-400"
          ></i>
        </div>
        <div class="flex items-baseline gap-2">
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Process Memory
          </h1>
          <span
            class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
          >
            Top resource-consuming processes analysis.
          </span>
        </div>
      </div>
    </div>

    <div
      class="mb-3 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-sm transition-colors duration-300 shrink-0"
    >
      <div
        class="flex items-center flex-1 gap-2 px-1 py-1 overflow-x-auto scrollbar-hide"
      >
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filterStore.selectedSite"
            :options="sites"
            placeholder="Site"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSite }"
            @change="onSiteChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filterStore.selectedSdwt"
            :options="sdwts"
            placeholder="SDWT"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !filterStore.selectedSdwt }"
            :disabled="!filterStore.selectedSite"
            @change="onSdwtChange"
          />
        </div>

        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="selectedEqpId"
            :options="eqpIds"
            filter
            placeholder="Select EQP"
            showClear
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            :class="{ '!text-slate-400': !selectedEqpId }"
            :disabled="!filterStore.selectedSdwt"
            @change="onEqpIdChange"
          />
        </div>

        <div class="w-px h-6 bg-slate-200 dark:bg-zinc-700 mx-1 shrink-0"></div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="startDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="Start Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>

        <div class="min-w-[150px] shrink-0">
          <DatePicker
            v-model="endDate"
            showIcon
            dateFormat="yy-mm-dd"
            placeholder="End Date"
            class="w-full custom-dropdown small date-picker"
          />
        </div>
      </div>

      <div
        class="flex items-center gap-2 pl-2 border-l shrink-0 border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-purple-600 !border-purple-600 hover:!bg-purple-700 !w-8 !h-8 !text-xs"
          @click="searchData"
          :loading="isLoading"
          :disabled="!selectedEqpId"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Reset'"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
          @click="resetFilters"
        />
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex-1 flex flex-col gap-4 pb-2 min-h-0 animate-fade-in"
    >
      <div
        class="relative flex flex-col h-[400px] shrink-0 p-4 bg-white border shadow-sm dark:bg-[#111111] rounded-xl border-slate-200 dark:border-zinc-800"
      >
        <div class="flex items-center justify-between mb-2 shrink-0">
          <h3
            class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <i class="text-purple-500 pi pi-chart-line"></i>
            Top Memory Consumers Trend
          </h3>
          <span class="text-[10px] text-slate-400 font-medium">
            (Displaying top {{ displayedProcessCount }} processes)
          </span>
        </div>

        <div class="relative w-full flex-1 min-h-0">
          <EChart
            v-if="!isLoading && chartData.length > 0"
            :option="chartOption"
            @chartCreated="onChartCreated"
          />

          <div
            v-else-if="!isLoading && chartData.length === 0"
            class="absolute inset-0 flex flex-col items-center justify-center text-slate-400"
          >
            <i class="mb-2 text-2xl opacity-50 pi pi-info-circle"></i>
            <span class="text-xs">No process data found for this period.</span>
          </div>

          <transition name="fade">
            <button
              v-if="isZoomed"
              @click="resetZoom"
              class="absolute top-2 right-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-colors z-10"
            >
              <i class="pi pi-refresh" style="font-size: 0.7rem"></i>
              Reset Zoom
            </button>
          </transition>
        </div>
      </div>

      <div
        class="flex-1 min-h-0 bg-white dark:bg-[#111111] rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col"
      >
        <div
          class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0"
        >
          <div class="flex items-center gap-2">
            <i class="text-xs text-purple-500 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Process Statistics Summary
            </h3>
          </div>
          <div class="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            <i class="pi pi-calendar mr-1 text-[10px]"></i>
            Period:
            <span class="font-bold text-slate-600 dark:text-slate-300">{{
              formattedPeriod
            }}</span>
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scrollbar">
          <table
            class="w-full text-xs text-left text-slate-600 dark:text-slate-400 table-fixed"
          >
            <thead
              class="text-[10px] text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 sticky top-0 z-10"
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 py-2.5 font-bold w-[50px] text-center"
                >
                  #
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold">Process Name</th>

                <th scope="col" class="px-4 py-2.5 font-bold text-right">
                  <div
                    class="flex items-center justify-end gap-1 cursor-help"
                    v-tooltip.top="'조회 기간 내 최대 메모리 사용량 (Peak)'"
                  >
                    Max Usage
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold text-right">
                  <div
                    class="flex items-center justify-end gap-1 cursor-help"
                    v-tooltip.top="'조회 기간 내 전체 평균 사용량 (Mean)'"
                  >
                    Avg Usage
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold text-right">
                  <div
                    class="flex items-center justify-end gap-1 cursor-help"
                    v-tooltip.top="'가장 최근 수집된 시점의 사용량 (Current)'"
                  >
                    Last Recorded
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
                <th scope="col" class="px-4 py-2.5 font-bold text-center">
                  <div
                    class="flex items-center justify-center gap-1 cursor-help"
                    v-tooltip.top="'평균 대비 최근 사용량의 증감 상태'"
                  >
                    Trend
                    <i class="pi pi-info-circle text-[9px] opacity-50"></i>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-zinc-800">
              <tr
                v-for="(proc, index) in processStats"
                :key="proc.name"
                class="transition-colors hover:bg-slate-50 dark:hover:bg-zinc-900/50 group"
              >
                <td class="px-4 py-2 font-mono text-center text-slate-400">
                  {{ index + 1 }}
                </td>
                <td
                  class="flex items-center gap-2 px-4 py-2 font-bold text-slate-700 dark:text-slate-200 truncate"
                >
                  <span
                    class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: proc.color }"
                  ></span>
                  <span class="truncate" :title="proc.name">{{
                    proc.name
                  }}</span>
                </td>
                <td
                  class="px-4 py-2 font-mono font-bold text-right text-purple-600 dark:text-purple-400"
                >
                  {{ proc.max.toLocaleString() }} MB
                </td>
                <td class="px-4 py-2 font-mono text-right">
                  {{ proc.avg.toFixed(0).toLocaleString() }} MB
                </td>
                <td class="px-4 py-2 font-mono text-right text-slate-500">
                  {{ proc.last.toLocaleString() }} MB
                </td>
                <td class="px-4 py-2 text-center">
                  <span
                    v-if="proc.last > proc.avg * 1.1"
                    class="text-red-500 text-[10px] font-bold bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded"
                  >
                    높음 (High)
                  </span>
                  <span
                    v-else-if="proc.last < proc.avg * 0.9"
                    class="text-emerald-500 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded"
                  >
                    낮음 (Low)
                  </span>
                  <span
                    v-else
                    class="text-slate-400 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded"
                  >
                    안정적 (Stable)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center flex-1 min-h-[400px] opacity-50 select-none"
    >
      <div
        class="flex items-center justify-center w-20 h-20 mb-4 rounded-full shadow-inner bg-slate-100 dark:bg-zinc-800"
      >
        <i class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-server"></i>
      </div>
      <p class="text-sm font-bold text-slate-500">
        Ready to analyze processes.
      </p>
      <p class="mt-1 text-xs text-slate-400">
        Select filters to view memory usage history.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useFilterStore } from "@/stores/filter";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { performanceApi, type ProcessMemoryDataDto } from "@/api/performance";
import EChart from "@/components/common/EChart.vue";
import type { ECharts } from "echarts";

// UI Components
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";

interface ProcessStat {
  name: string;
  color: string;
  max: number;
  avg: number;
  last: number;
}

// State
const filterStore = useFilterStore();
const selectedEqpId = ref("");
const startDate = ref(new Date(Date.now() - 24 * 60 * 60 * 1000));
const endDate = ref(new Date());

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);

const chartData = ref<any[]>([]); // ECharts dataset source
const processSeries = ref<any[]>([]); // ECharts series config
const processStats = ref<ProcessStat[]>([]); // 통계 데이터
const displayedProcessCount = ref(0);

const isLoading = ref(false);
const hasSearched = ref(false);
const isZoomed = ref(false);
let chartInstance: ECharts | null = null;

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

// Palette for lines
const colorPalette = [
  "#8b5cf6", // Violet
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#84cc16", // Lime
];

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();

  // Restore filters
  const savedSite = localStorage.getItem("dashboard_site");
  if (savedSite && sites.value.includes(savedSite)) {
    filterStore.setSite(savedSite);
    sdwts.value = await dashboardApi.getSdwts(savedSite);

    const savedSdwt = localStorage.getItem("dashboard_sdwt");
    if (savedSdwt) {
      filterStore.setSdwt(savedSdwt);
      await loadEqpIds();

      const savedEqpId = localStorage.getItem("process_eqpid");
      if (savedEqpId && eqpIds.value.includes(savedEqpId)) {
        selectedEqpId.value = savedEqpId;
      }
    }
  }

  themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        isDarkMode.value = document.documentElement.classList.contains("dark");
      }
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});

// --- Handlers ---
const onSiteChange = async () => {
  filterStore.setSite(filterStore.selectedSite);
  localStorage.setItem("dashboard_site", filterStore.selectedSite);

  selectedEqpId.value = "";
  localStorage.removeItem("process_eqpid");

  sdwts.value = filterStore.selectedSite
    ? await dashboardApi.getSdwts(filterStore.selectedSite)
    : [];
  eqpIds.value = [];
  hasSearched.value = false;
};

const onSdwtChange = async () => {
  if (filterStore.selectedSdwt) {
    localStorage.setItem("dashboard_sdwt", filterStore.selectedSdwt);
    await loadEqpIds();
  } else {
    localStorage.removeItem("dashboard_sdwt");
    eqpIds.value = [];
  }
  selectedEqpId.value = "";
  localStorage.removeItem("process_eqpid");
};

const onEqpIdChange = () => {
  if (selectedEqpId.value) {
    localStorage.setItem("process_eqpid", selectedEqpId.value);
  } else {
    localStorage.removeItem("process_eqpid");
  }
};

const loadEqpIds = async () => {
  eqpIds.value = await equipmentApi.getEqpIds(
    undefined,
    filterStore.selectedSdwt
  );
};

const searchData = async () => {
  if (!selectedEqpId.value) return;
  isLoading.value = true;
  hasSearched.value = true;
  isZoomed.value = false;

  try {
    const fixedStart = new Date(startDate.value);
    fixedStart.setHours(0, 0, 0, 0);

    const fixedEnd = new Date(endDate.value);
    fixedEnd.setHours(23, 59, 59, 999);

    // ▼▼▼ [추가] 기간에 따른 Fetch Interval 자동 계산 로직 (Performance Trend와 유사) ▼▼▼
    const diffMs = fixedEnd.getTime() - fixedStart.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);

    let fetchInterval = 60; // 기본값 1분

    if (diffDays <= 1)
      fetchInterval = 60; // 1일 이하: 1분 (Process 데이터는 양이 많으므로 5초보다는 60초 권장)
    else if (diffDays <= 3) fetchInterval = 300; // 3일 이하: 5분
    else if (diffDays <= 7) fetchInterval = 600; // 7일 이하: 10분
    else if (diffDays <= 30) fetchInterval = 1800; // 30일 이하: 30분
    else fetchInterval = 3600; // 30일 초과: 1시간

    // [수정] 계산된 fetchInterval을 API에 전달
    const rawData = await performanceApi.getProcessHistory(
      fixedStart.toISOString(),
      fixedEnd.toISOString(),
      selectedEqpId.value,
      fetchInterval
    );

    processData(rawData);
  } catch (e) {
    // ... (에러 처리 기존 유지)
    console.error(e);
    chartData.value = [];
    processSeries.value = [];
    processStats.value = [];
  } finally {
    isLoading.value = false;
  }
};

const processData = (data: ProcessMemoryDataDto[]) => {
  if (!data || data.length === 0) {
    chartData.value = [];
    processStats.value = [];
    return;
  }

  // 1. Identify Top Processes
  const procMap = new Map<
    string,
    { max: number; latest: number; dataPoints: number }
  >();

  // Find latest timestamp
  const timestamps = data.map((d) => new Date(d.timestamp).getTime());
  const maxTs = Math.max(...timestamps);

  data.forEach((d) => {
    if (!procMap.has(d.processName)) {
      procMap.set(d.processName, { max: 0, latest: 0, dataPoints: 0 });
    }
    const entry = procMap.get(d.processName)!;
    entry.max = Math.max(entry.max, d.memoryUsageMB);
    entry.dataPoints++;

    if (new Date(d.timestamp).getTime() === maxTs) {
      entry.latest = d.memoryUsageMB;
    }
  });

  const allProcs = Array.from(procMap.entries()).map(([name, stats]) => ({
    name,
    ...stats,
  }));

  // Top 5 by Max Usage OR Top 5 by Latest Usage
  const topByMax = [...allProcs].sort((a, b) => b.max - a.max).slice(0, 5);
  const topByLatest = [...allProcs]
    .sort((a, b) => b.latest - a.latest)
    .slice(0, 5);

  const targetProcesses = new Set([
    ...topByMax.map((p) => p.name),
    ...topByLatest.map((p) => p.name),
  ]);

  displayedProcessCount.value = targetProcesses.size;

  // 2. Prepare ECharts Dataset
  const timeMap = new Map<string, any>();

  data.forEach((d) => {
    if (!targetProcesses.has(d.processName)) return;

    let tsKey = String(d.timestamp);
    if (tsKey.includes(".")) {
      tsKey = tsKey.split(".")[0] ?? tsKey;
    }
    if (tsKey.includes("Z")) tsKey = tsKey.replace("Z", "");

    if (!timeMap.has(tsKey)) {
      timeMap.set(tsKey, { timestamp: tsKey });
    }
    timeMap.get(tsKey)[d.processName] = d.memoryUsageMB;
  });

  chartData.value = Array.from(timeMap.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 3. Prepare Series Config & Stats Table
  const series: any[] = [];
  const stats: ProcessStat[] = [];
  const sortedTargetProcs = Array.from(targetProcesses).sort();

  sortedTargetProcs.forEach((name, idx) => {
    // [수정] string 타입 보장
    const color = colorPalette[idx % colorPalette.length] ?? "#8b5cf6";

    series.push({
      name: name,
      type: "line",
      smooth: true,
      showSymbol: false,
      symbolSize: 4,
      itemStyle: { color: color },
      lineStyle: { width: 2 },
      encode: { x: "timestamp", y: name },
    });

    const pData = data.filter((d) => d.processName === name);
    const sum = pData.reduce((acc, cur) => acc + cur.memoryUsageMB, 0);
    const max = Math.max(...pData.map((d) => d.memoryUsageMB));
    const last =
      pData.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]?.memoryUsageMB || 0;

    stats.push({
      name,
      color,
      max,
      avg: sum / pData.length,
      last,
    });
  });

  processSeries.value = series;
  processStats.value = stats.sort((a, b) => b.max - a.max);
};

const resetFilters = () => {
  filterStore.reset();
  selectedEqpId.value = "";
  localStorage.removeItem("dashboard_site");
  localStorage.removeItem("dashboard_sdwt");
  localStorage.removeItem("process_eqpid");

  sdwts.value = [];
  eqpIds.value = [];
  hasSearched.value = false;
  chartData.value = [];
  processStats.value = [];
};

// ▼▼▼ [추가] 조회 기간 표시용 Computed 속성 ▼▼▼
const formattedPeriod = computed(() => {
  if (!startDate.value || !endDate.value) return "";

  const fmt = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // 시간까지 표시하고 싶다면 아래 주석을 해제하고 위 fmt를 수정하세요.
  // return `${fmt(startDate.value)} 00:00 ~ ${fmt(endDate.value)} 23:59`;
  return `${fmt(startDate.value)} ~ ${fmt(endDate.value)}`;
});

// --- ECharts Options ---
const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode.value
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      // ... (tooltip 설정은 그대로 유지) ...
      backgroundColor: isDarkMode.value
        ? "rgba(24, 24, 27, 0.9)"
        : "rgba(255, 255, 255, 0.95)",
      borderColor: isDarkMode.value ? "#3f3f46" : "#e2e8f0",
      textStyle: { color: isDarkMode.value ? "#fff" : "#1e293b" },
      formatter: (params: any) => {
        // ... (formatter 코드 그대로 유지) ...
        if (!params || !params[0]) return "";
        const xDate = new Date(params[0].axisValueLabel);
        const timeStr = isNaN(xDate.getTime())
          ? params[0].axisValueLabel
          : `${String(xDate.getHours()).padStart(2, "0")}:${String(
              xDate.getMinutes()
            ).padStart(2, "0")}`;

        let html = `<div class="font-bold mb-1 border-b border-gray-500 pb-1">${timeStr}</div>`;

        const sortedParams = [...params].sort(
          (a, b) => (b.value[b.seriesName] || 0) - (a.value[a.seriesName] || 0)
        );

        sortedParams.forEach((p: any) => {
          const val = p.value[p.seriesName];
          if (val !== undefined) {
            const colorDot = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${p.color};"></span>`;
            html += `<div class="flex justify-between items-center gap-4 text-xs">
               <span>${colorDot} ${p.seriesName}</span>
               <span class="font-mono font-bold">${Number(
                 val
               ).toLocaleString()} MB</span>
             </div>`;
          }
        });
        return html;
      },
    },
    // ▼▼▼ [수정 1] 범례(Legend)를 우측 수직 정렬로 변경 ▼▼▼
    legend: {
      show: true,
      type: "scroll", // 항목이 많아지면 스크롤 처리
      orient: "vertical", // 수직으로 쌓임
      right: 10, // 오른쪽 끝에서 10px 띄움 (파란 박스 위치)
      top: "middle", // 수직 중앙 정렬
      itemGap: 10, // 아이템 간 간격
      textStyle: {
        color: textColor,
        fontSize: 11,
        overflow: "truncate", // 글자가 너무 길면 ... 처리
        width: 130, // 텍스트 최대 너비 제한
      },
      pageIconColor: textColor,
      pageTextStyle: { color: textColor },
    },
    // ▼▼▼ [수정 2] 그리드(차트 영역) 오른쪽 여백 확보 ▼▼▼
    grid: {
      left: 60,
      right: 170, // 범례가 들어갈 공간만큼 차트를 왼쪽으로 밀어냄 (범례 너비 + 여백)
      top: 30, // 범례가 옆으로 갔으니 상단 여백은 조금 줄여도 됨
      bottom: 30,
    },
    dataZoom: [{ type: "inside", xAxisIndex: [0], filterMode: "filter" }],
    dataset: {
      source: chartData.value,
    },
    xAxis: {
      // ... (기존 유지) ...
      type: "category",
      boundaryGap: false,
      axisLabel: {
        color: textColor,
        fontSize: 10,
        formatter: (value: string) => {
          const d = new Date(value);
          if (isNaN(d.getTime())) return value;
          return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate()
          ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
            d.getMinutes()
          ).padStart(2, "0")}`;
        },
      },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      // ... (기존 유지) ...
      type: "value",
      name: "Memory (MB)",
      nameTextStyle: { color: textColor, padding: [0, 0, 0, 20] },
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: processSeries.value,
  };
});

const onChartCreated = (instance: any) => {
  chartInstance = instance;
  instance.on("dataZoom", () => {
    const opt = instance.getOption();
    if (opt.dataZoom && opt.dataZoom[0]) {
      const start = opt.dataZoom[0].start;
      const end = opt.dataZoom[0].end;
      isZoomed.value = start > 0 || end < 100;
    }
  });
};

const resetZoom = () => {
  if (chartInstance) {
    chartInstance.dispatchAction({ type: "dataZoom", start: 0, end: 100 });
    isZoomed.value = false;
  }
};
</script>

<style scoped>
/* 기존 스타일 유지 */
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}
:deep(.custom-input-text.small) {
  @apply !text-[13px] !p-1 !h-7 !bg-transparent !border-0;
}
:deep(.date-picker .p-inputtext) {
  @apply !text-[13px] !py-1 !px-2 !h-7;
}
:deep(.p-select-clear-icon),
:deep(.p-datepicker-clear-icon) {
  @apply text-[9px] text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown),
:deep(.p-autocomplete-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg),
:deep(.p-autocomplete-dropdown svg) {
  @apply w-3 h-3;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom Scrollbar for Table */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

<style>
/* Global Popover Styles */
.custom-dropdown-panel .p-select-option {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
.custom-dropdown-panel .p-select-empty-message {
  padding: 6px 10px !important;
  font-size: 11px !important;
}
.custom-dropdown-panel.small .p-select-option {
  padding: 6px 10px !important;
  font-size: 12px !important;
}
</style>
