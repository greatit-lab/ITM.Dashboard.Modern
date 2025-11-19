<template>
  <div
    class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
  >
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-chart-bar text-3xl text-teal-600"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Wafer Flat Data
      </h1>
    </div>

    <div
      class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Dropdown
          v-model="filters.site"
          :options="options.sites"
          placeholder="Site"
          class="w-full"
          @change="onSiteChange"
        />
        <Dropdown
          v-model="filters.sdwt"
          :options="options.sdwts"
          placeholder="SDWT"
          class="w-full"
          :disabled="!filters.site"
          @change="onSdwtChange"
        />
        <AutoComplete
          v-model="filters.eqpId"
          :suggestions="options.eqpIds"
          @complete="searchEqpId"
          placeholder="EQP ID"
          class="w-full"
          :disabled="!filters.sdwt"
          @item-select="onEqpIdChange"
        />
        <AutoComplete
          v-model="filters.lotId"
          :suggestions="options.lotIds"
          @complete="searchLotId"
          placeholder="Lot ID"
          class="w-full"
          :disabled="!filters.eqpId"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Calendar
          v-model="filters.startDate"
          dateFormat="yy-mm-dd"
          showIcon
          placeholder="Start Date"
          class="w-full"
        />
        <Calendar
          v-model="filters.endDate"
          dateFormat="yy-mm-dd"
          showIcon
          placeholder="End Date"
          class="w-full"
        />
        <Button
          label="Search"
          icon="pi pi-search"
          @click="searchData"
          :disabled="!filters.eqpId"
        />
        <Button
          label="Reset"
          icon="pi pi-refresh"
          severity="secondary"
          @click="resetFilters"
        />
      </div>
    </div>

    <div v-if="rows.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"
        >
          <DataTable
            :value="rows"
            v-model:selection="selectedRow"
            selectionMode="single"
            @rowSelect="onRowSelect"
            :rows="10"
            paginator
            stripedRows
            class="p-datatable-sm"
          >
            <Column field="servTs" header="Date Time">
              <template #body="{ data }">{{
                new Date(data.servTs).toLocaleString()
              }}</template>
            </Column>
            <Column field="lotId" header="Lot ID"></Column>
            <Column field="waferId" header="Wafer ID"></Column>
            <Column field="cassetteRcp" header="Cassette RCP"></Column>
            <Column field="stageRcp" header="Stage RCP"></Column>
          </DataTable>
        </div>

        <div
          v-if="statistics"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4"
        >
          <h3 class="font-bold text-lg mb-3 text-slate-700 dark:text-slate-200">
            Statistics
          </h3>
          <table
            class="w-full text-sm text-left text-slate-600 dark:text-slate-300"
          >
            <thead class="bg-slate-100 dark:bg-slate-700 text-xs uppercase">
              <tr>
                <th class="px-3 py-2">Item</th>
                <th class="px-3 py-2 text-right">T1 (Å)</th>
                <th class="px-3 py-2 text-right">GOF</th>
                <th class="px-3 py-2 text-right">Z (㎛)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b dark:border-slate-700">
                <td class="px-3 py-2 font-semibold">Mean</td>
                <td class="px-3 py-2 text-right">
                  {{ statistics.t1.mean.toFixed(3) }}
                </td>
                <td class="px-3 py-2 text-right">
                  {{ statistics.gof.mean.toFixed(3) }}
                </td>
                <td class="px-3 py-2 text-right">
                  {{ statistics.z.mean.toFixed(3) }}
                </td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-semibold">Range</td>
                <td class="px-3 py-2 text-right">
                  {{ statistics.t1.range.toFixed(3) }}
                </td>
                <td class="px-3 py-2 text-right">
                  {{ statistics.gof.range.toFixed(3) }}
                </td>
                <td class="px-3 py-2 text-right">
                  {{ statistics.z.range.toFixed(3) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 h-full flex flex-col items-center justify-center min-h-[400px]"
        >
          <h3 class="font-bold text-lg mb-4 self-start w-full border-b pb-2">
            Wafer Image
          </h3>

          <div v-if="isImageLoading" class="flex justify-center">
            <ProgressSpinner />
          </div>
          <div
            v-else-if="pdfImageUrl"
            class="relative border-4 border-slate-200 rounded-full overflow-hidden w-64 h-64"
          >
            <img :src="pdfImageUrl" class="w-full h-full object-cover" />
            <div
              class="absolute top-1/2 left-0 w-full h-px bg-red-500/50"
            ></div>
            <div
              class="absolute top-0 left-1/2 w-px h-full bg-red-500/50"
            ></div>
          </div>
          <div v-else class="text-slate-400 text-center">
            <i class="pi pi-image text-4xl mb-2"></i>
            <p>Select a point to view image</p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="pointData"
      class="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"
    >
      <h3 class="font-bold text-lg p-4 border-b dark:border-slate-700">
        Point Data
      </h3>
      <div class="overflow-x-auto max-h-60">
        <table class="w-full text-sm text-center">
          <thead class="bg-slate-100 dark:bg-slate-700 sticky top-0">
            <tr>
              <th
                v-for="header in pointData.headers"
                :key="header"
                class="px-4 py-2 whitespace-nowrap"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in pointData.data"
              :key="idx"
              @click="onPointSelect(idx)"
              class="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-600"
              :class="{
                'bg-blue-100 dark:bg-slate-600': selectedPointIndex === idx,
              }"
            >
              <td
                v-for="(cell, cIdx) in row"
                :key="cIdx"
                class="px-4 py-1 border-b dark:border-slate-700"
              >
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard"; // 공통 API
import {
  waferApi,
  type WaferFlatDataDto,
  type StatisticsDto,
  type PointDataResponseDto,
} from "@/api/wafer";

// UI Components
import Dropdown from "primevue/dropdown";
import AutoComplete from "primevue/autocomplete";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ProgressSpinner from "primevue/progressspinner";

// State
const filters = reactive({
  site: "",
  sdwt: "",
  eqpId: "",
  lotId: "",
  startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
  endDate: new Date(),
});
const options = reactive({
  sites: [] as string[],
  sdwts: [] as string[],
  eqpIds: [] as string[],
  lotIds: [] as string[],
});

const rows = ref<WaferFlatDataDto[]>([]);
const selectedRow = ref<WaferFlatDataDto | null>(null);
const statistics = ref<StatisticsDto | null>(null);
const pointData = ref<PointDataResponseDto | null>(null);
const selectedPointIndex = ref(-1);
const pdfImageUrl = ref<string | null>(null);
const isImageLoading = ref(false);

// Lifecycle
onMounted(async () => {
  options.sites = await dashboardApi.getSites();
});

// Methods
const onSiteChange = async () => {
  options.sdwts = await dashboardApi.getSdwts(filters.site);
};
const onSdwtChange = async () => {
  /* Load EQPs if needed */
};
const searchEqpId = async () => {
  options.eqpIds = await waferApi.getDistinctValues("eqpids", {
    sdwt: filters.sdwt,
  });
};
const searchLotId = async () => {
  options.lotIds = await waferApi.getDistinctValues("lotids", {
    eqpId: filters.eqpId,
  });
};
const onEqpIdChange = () => {
  /* Reset dependent filters */
};

const searchData = async () => {
  const params = {
    eqpId: filters.eqpId,
    lotId: filters.lotId,
    startDate: filters.startDate.toISOString(),
    endDate: filters.endDate.toISOString(),
  };
  const res = await waferApi.getFlatData(params);
  rows.value = res.items;
};

const onRowSelect = async () => {
  if (!selectedRow.value) return;
  const params = {
    ...selectedRow.value,
    servTs: selectedRow.value.servTs,
    dateTime: selectedRow.value.dateTime,
  };

  // Load Stats & Point Data
  const [stats, pData] = await Promise.all([
    waferApi.getStatistics(params),
    waferApi.getPointData(params),
  ]);
  statistics.value = stats;
  pointData.value = pData;
  selectedPointIndex.value = -1;
  pdfImageUrl.value = null;
};

const onPointSelect = (index: number) => {
  if (!selectedRow.value) return;
  selectedPointIndex.value = index;
  isImageLoading.value = true;
  // 이미지 URL 생성 (실제로는 이미지가 존재하는지 체크 후 할당)
  pdfImageUrl.value = waferApi.getPdfImageUrl(
    selectedRow.value.eqpId,
    selectedRow.value.dateTime,
    index
  );
  // 이미지 로딩 시뮬레이션
  setTimeout(() => (isImageLoading.value = false), 300);
};

const resetFilters = () => {
  filters.site = "";
  filters.sdwt = "";
  rows.value = [];
  selectedRow.value = null;
};
</script>
