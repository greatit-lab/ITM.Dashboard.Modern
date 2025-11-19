<template>
  <div class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-server text-3xl text-purple-500"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Process Memory
      </h1>
    </div>

    <div
      class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
    >
      <div class="w-full">
        <Dropdown
          v-model="selectedSite"
          :options="sites"
          placeholder="Site"
          class="w-full"
          @change="onSiteChange"
        />
      </div>
      <div class="w-full">
        <Dropdown
          v-model="selectedSdwt"
          :options="sdwts"
          placeholder="SDWT"
          class="w-full"
          :disabled="!selectedSite"
          @change="onSdwtChange"
          showClear
        />
      </div>
      <div class="w-full">
        <AutoComplete
          v-model="selectedEqpId"
          :suggestions="filteredEqpIds"
          @complete="searchEqpId"
          placeholder="EQP ID"
          class="w-full"
          :disabled="!selectedSdwt"
        />
      </div>
      <div class="flex gap-2 w-full md:col-span-1">
        <Calendar
          v-model="startDate"
          placeholder="Start"
          showIcon
          dateFormat="yy-mm-dd"
          class="w-full"
        />
        <Calendar
          v-model="endDate"
          placeholder="End"
          showIcon
          dateFormat="yy-mm-dd"
          class="w-full"
        />
      </div>
      <div class="w-full">
        <Button
          label="Search"
          icon="pi pi-search"
          class="w-full"
          @click="searchData"
          :disabled="!selectedEqpId"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 h-[600px]">
      <h3 class="font-bold text-lg mb-4 text-slate-700 dark:text-slate-200">
        Top Process Memory Usage
      </h3>

      <div v-if="isLoading" class="h-full flex justify-center items-center">
        <ProgressSpinner />
      </div>
      <div v-else-if="chartData.length > 0" class="h-full">
        <AmChart
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="chartConfig"
          height="100%"
          :isDarkMode="false"
        />
      </div>
      <div
        v-else
        class="h-full flex justify-center items-center text-slate-400"
      >
        <i class="pi pi-chart-line text-4xl mr-2"></i>
        <span>데이터가 없습니다. 조건을 선택하고 조회하세요.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { performanceApi, type ProcessMemoryDataDto } from "@/api/performance";
import AmChart from "@/components/common/AmChart.vue";

// UI Components
import Dropdown from "primevue/dropdown";
import AutoComplete from "primevue/autocomplete";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

// State
const selectedSite = ref("");
const selectedSdwt = ref("");
const selectedEqpId = ref("");
const startDate = ref(new Date(Date.now() - 24 * 60 * 60 * 1000));
const endDate = ref(new Date());

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);

const chartData = ref<any[]>([]);
const chartConfig = ref<any>({});
const isLoading = ref(false);

// Lifecycle
onMounted(async () => {
  sites.value = await dashboardApi.getSites();
});

// Methods
const onSiteChange = async () => {
  selectedSdwt.value = "";
  selectedEqpId.value = "";
  sdwts.value = selectedSite.value
    ? await dashboardApi.getSdwts(selectedSite.value)
    : [];
  eqpIds.value = [];
};

const onSdwtChange = async () => {
  selectedEqpId.value = "";
  if (selectedSdwt.value) {
    eqpIds.value = await equipmentApi.getEqpIds(undefined, selectedSdwt.value);
  }
};

const searchEqpId = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};

const searchData = async () => {
  if (!selectedEqpId.value) return;
  isLoading.value = true;

  try {
    const data = await performanceApi.getProcessHistory(
      startDate.value.toISOString(),
      endDate.value.toISOString(),
      selectedEqpId.value
    );

    const groupedMap = new Map<string, any>();
    const processNames = new Set<string>();

    // [핵심 수정] d 변수에 타입(ProcessMemoryDataDto)을 명시하여 'any' 오류 해결
    data.forEach((d: ProcessMemoryDataDto) => {
      const timeKey = d.timestamp;
      if (!groupedMap.has(timeKey)) {
        groupedMap.set(timeKey, { timestamp: timeKey });
      }
      const item = groupedMap.get(timeKey);
      item[d.processName] = d.memoryUsageMB;
      processNames.add(d.processName);
    });

    // 시간순 정렬
    chartData.value = Array.from(groupedMap.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // 동적으로 시리즈 설정 생성
    const seriesConfig = Array.from(processNames).map((name, idx) => ({
      name: name,
      valueField: name,
      color: getColor(idx),
      tooltipText: `[bold]${name}[/]: {valueY} MB`,
    }));

    chartConfig.value = {
      xField: "timestamp",
      xTimeUnit: "minute",
      series: seriesConfig,
    };
  } catch (e) {
    console.error(e);
  } finally {
    isLoading.value = false;
  }
};

const getColor = (idx: number) => {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
    "#db2777",
  ];
  return colors[idx % colors.length];
};
</script>
