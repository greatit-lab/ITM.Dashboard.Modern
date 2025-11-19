<template>
  <div class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-sun text-3xl text-yellow-500"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        Lamp LifeTime
      </h1>
    </div>

    <div
      class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap gap-4"
    >
      <div class="w-full md:w-64">
        <Dropdown
          v-model="selectedSite"
          :options="sites"
          placeholder="Site"
          class="w-full"
          @change="onSiteChange"
        />
      </div>
      <div class="w-full md:w-64">
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
      <div class="w-full md:w-64">
        <AutoComplete
          v-model="selectedEqpId"
          :suggestions="filteredEqpIds"
          @complete="searchEqpId"
          placeholder="EQP ID"
          class="w-full"
          :disabled="!selectedSite"
        />
      </div>
      <Button
        label="Search"
        icon="pi pi-search"
        @click="searchData"
        :disabled="!selectedSdwt"
      />
      <Button
        label="Reset"
        icon="pi pi-refresh"
        severity="secondary"
        @click="reset"
      />
    </div>

    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"
    >
      <DataTable
        :value="lampList"
        :paginator="true"
        :rows="15"
        :loading="isLoading"
        stripedRows
        class="p-datatable-sm"
      >
        <template #empty
          ><div class="p-4 text-center text-slate-500">
            데이터가 없습니다.
          </div></template
        >

        <Column
          field="eqpId"
          header="EQP ID"
          sortable
          class="font-bold"
        ></Column>
        <Column field="lampId" header="Lamp ID"></Column>
        <Column field="ageHour" header="Age (Hr)" sortable></Column>
        <Column field="lifespanHour" header="Lifespan (Hr)"></Column>

        <Column header="Used Life" style="width: 25%">
          <template #body="{ data }">
            <div
              class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 relative overflow-hidden"
            >
              <div
                class="h-full absolute left-0 top-0 transition-all duration-500"
                :class="getProgressColor(getUsage(data))"
                :style="{ width: Math.min(getUsage(data), 100) + '%' }"
              ></div>
              <div
                class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-white shadow-sm"
              >
                {{ getUsage(data).toFixed(1) }}%
              </div>
            </div>
          </template>
        </Column>

        <Column field="lastChanged" header="Last Changed">
          <template #body="{ data }">{{
            formatDate(data.lastChanged)
          }}</template>
        </Column>
        <Column field="ts" header="Collected At">
          <template #body="{ data }">{{ formatDate(data.ts) }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi } from "@/api/equipment";
import { lampApi, type LampLifeDto } from "@/api/lamp";

// UI
import Dropdown from "primevue/dropdown";
import AutoComplete from "primevue/autocomplete";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const selectedSite = ref("");
const selectedSdwt = ref("");
const selectedEqpId = ref("");
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);
const lampList = ref<LampLifeDto[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
});

const onSiteChange = async () => {
  selectedSdwt.value = "";
  selectedEqpId.value = "";
  sdwts.value = selectedSite.value
    ? await dashboardApi.getSdwts(selectedSite.value)
    : [];
  eqpIds.value = selectedSite.value
    ? await equipmentApi.getEqpIds(selectedSite.value)
    : [];
};
const onSdwtChange = async () => {
  if (selectedSdwt.value)
    eqpIds.value = await equipmentApi.getEqpIds(undefined, selectedSdwt.value);
};
const searchEqpId = (e: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(e.query.toLowerCase())
  );
};

const searchData = async () => {
  isLoading.value = true;
  try {
    lampList.value = await lampApi.getData(
      selectedSite.value,
      selectedSdwt.value,
      selectedEqpId.value
    );
  } finally {
    isLoading.value = false;
  }
};
const reset = () => {
  selectedSite.value = "";
  lampList.value = [];
};

const getUsage = (item: LampLifeDto) =>
  (item.ageHour / item.lifespanHour) * 100;
const getProgressColor = (usage: number) =>
  usage > 80 ? "bg-red-500" : usage > 50 ? "bg-orange-400" : "bg-green-500";
const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString() : "-";
</script>
