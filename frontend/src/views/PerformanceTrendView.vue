<template>
  <div class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-chart-line text-3xl text-teal-600"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Performance Trend
      </h1>
    </div>

    <div
      class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 flex gap-4 items-end"
    >
      <div class="flex-1">
        <label class="block text-xs font-bold text-slate-500 mb-1"
          >EQP ID</label
        >
        <AutoComplete
          v-model="selectedEqpId"
          :suggestions="eqpIds"
          @complete="searchEqp"
          class="w-full"
        />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-bold text-slate-500 mb-1"
          >Interval</label
        >
        <Dropdown
          v-model="interval"
          :options="intervalOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>
      <Button label="Search" icon="pi pi-search" @click="fetchData" />
      <Button
        label="Real-time"
        :icon="isRealtime ? 'pi pi-stop' : 'pi pi-play'"
        :severity="isRealtime ? 'danger' : 'success'"
        @click="toggleRealtime"
      />
    </div>

    <div
      v-if="chartData.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-80">
        <h3 class="font-bold mb-2">CPU Usage</h3>
        <AmChart
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="cpuConfig"
        />
      </div>

      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-80">
        <h3 class="font-bold mb-2">Memory Usage</h3>
        <AmChart
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="memConfig"
        />
      </div>

      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-80">
        <h3 class="font-bold mb-2">Temperature</h3>
        <AmChart
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="tempConfig"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { performanceApi } from "@/api/performance";
import AmChart from "@/components/common/AmChart.vue";

// UI
import AutoComplete from "primevue/autocomplete";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

const selectedEqpId = ref("");
const eqpIds = ref<string[]>(["EQP-001", "EQP-002"]); // Demo
const interval = ref(300);
const intervalOptions = [
  { label: "10 Sec", value: 10 },
  { label: "1 Min", value: 60 },
  { label: "5 Min", value: 300 },
];
const chartData = ref<any[]>([]);
const isRealtime = ref(false);
let timer: number | null = null;

// Chart Configs
const commonConfig = {
  xField: "timestamp",
  xTimeUnit: "second",
  xAxisDateFormat: "HH:mm:ss",
};
const cpuConfig = {
  ...commonConfig,
  series: [{ name: "CPU", valueField: "cpuUsage", color: "#3b82f6" }],
};
const memConfig = {
  ...commonConfig,
  series: [{ name: "Memory", valueField: "memoryUsage", color: "#10b981" }],
};
const tempConfig = {
  ...commonConfig,
  series: [
    { name: "CPU Temp", valueField: "cpuTemp", color: "#f59e0b" },
    { name: "GPU Temp", valueField: "gpuTemp", color: "#ef4444" },
  ],
};

const searchEqp = () => {
  /* Filter Logic */
};
const fetchData = async () => {
  // 실제로는 Date Picker 값 사용
  const end = new Date();
  const start = new Date(end.getTime() - 3600000);
  chartData.value = await performanceApi.getHistory(
    start.toISOString(),
    end.toISOString(),
    selectedEqpId.value,
    interval.value
  );
};

const toggleRealtime = () => {
  isRealtime.value = !isRealtime.value;
  if (isRealtime.value) {
    timer = setInterval(fetchData, interval.value * 1000);
  } else if (timer) {
    clearInterval(timer);
  }
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
