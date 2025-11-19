<template>
  <div class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-exclamation-circle text-3xl text-red-500"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Alert History
      </h1>
    </div>

    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div class="md:col-span-1">
          <Dropdown
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            class="w-full"
            @change="onSiteChange"
          />
        </div>
        <div class="md:col-span-1">
          <Dropdown
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            class="w-full"
            :disabled="!filter.site"
            @change="onSdwtChange"
            showClear
          />
        </div>
        <div class="md:col-span-1">
          <AutoComplete
            v-model="filter.eqpId"
            :suggestions="filteredEqpIds"
            @complete="searchEqp"
            placeholder="EQP ID"
            class="w-full"
            :disabled="!filter.sdwt"
          />
        </div>
        <div class="md:col-span-1">
          <Calendar
            v-model="filter.dateRange"
            selectionMode="range"
            :manualInput="false"
            dateFormat="yy-mm-dd"
            placeholder="Date Range"
            class="w-full"
            showIcon
          />
        </div>
        <div class="md:col-span-1 flex gap-2">
          <Button
            label="Search"
            class="flex-1"
            @click="search"
            :disabled="!filter.sdwt"
          />
          <Button label="Reset" severity="secondary" @click="reset" />
        </div>
      </div>
    </div>

    <div v-if="isSearched" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-l-4 border-red-500"
        >
          <p class="text-slate-500 font-bold text-xs uppercase">Total Alerts</p>
          <p class="text-3xl font-extrabold text-red-500 mt-1">
            {{ summary.totalErrorCount }}
          </p>
        </div>
        <div
          class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-l-4 border-orange-500"
        >
          <p class="text-slate-500 font-bold text-xs uppercase">
            Intool with Alerts
          </p>
          <p
            class="text-3xl font-extrabold text-slate-800 dark:text-white mt-1"
          >
            {{ summary.errorEqpCount }}
          </p>
        </div>
        <div
          class="md:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-500"
        >
          <p class="text-slate-500 font-bold text-xs uppercase">Top Alert</p>
          <div class="flex items-baseline gap-3 mt-1">
            <p class="text-2xl font-bold text-blue-600">
              {{ summary.topErrorId }}
            </p>
            <p class="text-slate-600 dark:text-slate-400 truncate">
              {{ summary.topErrorLabel }}
            </p>
            <p class="ml-auto text-xl font-bold">
              {{ summary.topErrorCount }}
              <span class="text-sm font-normal">Count</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="md:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-80"
        >
          <h3 class="font-bold mb-2">Alert Trend</h3>
          <AmChart
            chartType="PerformanceLineChart"
            :data="trendData"
            :config="trendConfig"
          />
        </div>
        <div
          class="md:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm h-80"
        >
          <h3 class="font-bold mb-2">Alerts by Intool</h3>
          <AmChart
            chartType="PerformanceLineChart"
            :data="summary.errorCountByEqp"
            :config="columnConfig"
          />
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        <DataTable
          :value="logs"
          :rows="10"
          paginator
          stripedRows
          class="p-datatable-sm"
        >
          <Column field="timeStamp" header="Time" style="width: 160px">
            <template #body="{ data }">{{
              new Date(data.timeStamp).toLocaleString()
            }}</template>
          </Column>
          <Column
            field="eqpId"
            header="EQP ID"
            style="width: 120px"
            sortable
            class="font-bold"
          ></Column>
          <Column
            field="errorId"
            header="Error ID"
            style="width: 100px"
          ></Column>
          <Column
            field="errorLabel"
            header="Label"
            style="width: 150px"
          ></Column>
          <Column field="errorDesc" header="Description"></Column>
          <Column field="extraMessage1" header="Extra 1"></Column>
        </DataTable>
      </div>
    </div>

    <div v-else class="flex justify-center items-center h-64 text-slate-400">
      <p>조건을 선택하고 조회하세요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { errorApi, type ErrorAnalyticsSummaryDto } from "@/api/error";
import AmChart from "@/components/common/AmChart.vue";

// UI
import Dropdown from "primevue/dropdown";
import AutoComplete from "primevue/autocomplete";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const filter = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  dateRange: [new Date(Date.now() - 7 * 24 * 3600000), new Date()] as Date[],
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
// eqpIds 삭제됨
const filteredEqpIds = ref<string[]>([]);
const isSearched = ref(false);

const summary = ref<ErrorAnalyticsSummaryDto>({
  totalErrorCount: 0,
  errorEqpCount: 0,
  topErrorId: "",
  topErrorCount: 0,
  topErrorLabel: "",
  errorCountByEqp: [],
});
const trendData = ref<any[]>([]);
const logs = ref<any[]>([]);

// Chart Configs
// 기존 C#의 ErrorTrendColumnChart 로직을 PerformanceLineChart 로직으로 대체하여 사용 (설정만 변경하면 됨)
// 또는 ColumnChart 전용 로직을 AmChart.vue에 추가해야 함. 여기서는 LineChart로 유사 구현.
const trendConfig = {
  xField: "date",
  xTimeUnit: "day",
  xAxisDateFormat: "MM-dd",
  series: [
    {
      name: "Count",
      valueField: "count",
      color: "#ef4444",
      tooltipText: "{valueY}건",
    },
  ],
};

// Column Chart를 위한 임시 설정 (실제로는 AmChart.vue에 ColumnSeries 로직 추가 권장)
const columnConfig = {
  xField: "label", // Category Axis 필요
  // 여기서는 데모용으로 둠. 실제 구현 시 AmChart.vue 업데이트 필요.
  series: [{ name: "Count", valueField: "value", color: "#3b82f6" }],
};

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
});

const onSiteChange = async () => {
  sdwts.value = await dashboardApi.getSdwts(filter.site);
};

const onSdwtChange = async () => {
  // API call to get eqpIds for error analytics
};

const searchEqp = () => {
  // Filter logic (추후 구현 예정)
};

const search = async () => {
  if (!filter.dateRange[0] || !filter.dateRange[1]) return;

  const params = {
    site: filter.site,
    sdwt: filter.sdwt,
    eqpids: filter.eqpId,
    startDate: filter.dateRange[0].toISOString(),
    endDate: filter.dateRange[1].toISOString(),
  };

  const [sumData, trData, logData] = await Promise.all([
    errorApi.getSummary(params),
    errorApi.getTrend(params),
    errorApi.getLogs({ ...params, page: 0, pageSize: 100 }),
  ]);

  summary.value = sumData;
  trendData.value = trData;
  logs.value = logData.items;
  isSearched.value = true;
};

const reset = () => {
  isSearched.value = false;
  filter.site = "";
  // Reset others
};
</script>
