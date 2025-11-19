<template>
  <div class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-compass text-3xl text-indigo-500"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        PreAlign Data
      </h1>
    </div>

    <div
      class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
    >
      <Dropdown
        v-model="selectedSite"
        :options="sites"
        placeholder="Site"
        class="w-full"
        @change="onSiteChange"
      />
      <Dropdown
        v-model="selectedSdwt"
        :options="sdwts"
        placeholder="SDWT"
        class="w-full"
        :disabled="!selectedSite"
        @change="onSdwtChange"
        showClear
      />
      <AutoComplete
        v-model="selectedEqpId"
        :suggestions="filteredEqpIds"
        @complete="searchEqpId"
        placeholder="EQP ID"
        class="w-full"
        :disabled="!selectedSdwt"
      />
      <div class="flex gap-2">
        <Calendar
          v-model="startDate"
          placeholder="Start"
          showIcon
          class="w-full"
        /><Calendar
          v-model="endDate"
          placeholder="End"
          showIcon
          class="w-full"
        />
      </div>
      <Button
        label="Search"
        icon="pi pi-search"
        @click="searchData"
        :disabled="!selectedEqpId"
      />
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 h-[500px]">
      <h3 class="font-bold text-lg mb-4">PreAlign Trend (X/Y & Notch)</h3>
      <div v-if="chartData.length > 0" class="h-full">
        <AmChart
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="chartConfig"
          height="100%"
        />
      </div>
      <div
        v-else
        class="h-full flex justify-center items-center text-slate-400"
      >
        데이터 없음
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { preAlignApi } from "@/api/prealign";
import AmChart from "@/components/common/AmChart.vue";
import Dropdown from "primevue/dropdown";
import AutoComplete from "primevue/autocomplete";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

const selectedSite = ref("");
const selectedSdwt = ref("");
const selectedEqpId = ref("");
const startDate = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
const endDate = ref(new Date());

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);
const chartData = ref<any[]>([]);

// 이중 축 설정 (Y1: Xmm/Ymm, Y2: Notch)
const chartConfig = {
  xField: "timestamp",
  xTimeUnit: "minute",
  yAxes: [
    { min: -0.5, max: 0.5 }, // Left Axis (mm)
    { opposite: true }, // Right Axis (Notch)
  ],
  series: [
    {
      name: "Xmm",
      valueField: "xmm",
      color: "#3b82f6",
      yAxisIndex: 0,
      tooltipText: "X: {valueY}",
    },
    {
      name: "Ymm",
      valueField: "ymm",
      color: "#10b981",
      yAxisIndex: 0,
      tooltipText: "Y: {valueY}",
    },
    {
      name: "Notch",
      valueField: "notch",
      color: "#f59e0b",
      yAxisIndex: 1,
      tooltipText: "N: {valueY}",
    },
  ],
};

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
});
const onSiteChange = async () => {
  sdwts.value = selectedSite.value
    ? await dashboardApi.getSdwts(selectedSite.value)
    : [];
  eqpIds.value = [];
};
const onSdwtChange = async () => {
  if (selectedSdwt.value)
    eqpIds.value = await equipmentApi.getEqpIds(undefined, selectedSdwt.value); // 단순화: 전체 장비 목록 사용
};
const searchEqpId = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};

const searchData = async () => {
  chartData.value = await preAlignApi.getData(
    selectedEqpId.value,
    startDate.value.toISOString(),
    endDate.value.toISOString()
  );
};
</script>
