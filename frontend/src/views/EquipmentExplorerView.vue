<template>
  <div class="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="flex items-center gap-3 mb-6">
      <i class="pi pi-desktop text-3xl text-teal-600"></i>
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
        ITM Equip Specs
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
          @item-select="loadData"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden"
    >
      <DataTable
        :value="equipmentList"
        :paginator="true"
        :rows="15"
        :rowsPerPageOptions="[15, 30, 50]"
        stripedRows
        class="p-datatable-sm text-sm"
        :loading="isLoading"
        scrollable
      >
        <template #empty>
          <div class="p-4 text-center text-slate-500">
            데이터가 없습니다. Site를 선택해주세요.
          </div>
        </template>

        <ColumnGroup type="header">
          <Row>
            <Column header="EQP ID" :rowspan="2" frozen />
            <Column
              header="ITM INFO"
              :colspan="6"
              headerClass="text-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <Column
              header="HOST SERVER INFO"
              :colspan="10"
              headerClass="text-center border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <Column header="Last Contact" :rowspan="2" />
          </Row>
          <Row>
            <Column header="Type" />
            <Column header="Model" />
            <Column header="App" />
            <Column header="App Ver" />
            <Column header="DB Ver" />
            <Column header="Serial" />

            <Column header="PC Name" />
            <Column header="IP" />
            <Column header="MAC" />
            <Column header="OS" />
            <Column header="Locale" />
            <Column header="Timezone" />
            <Column header="CPU" />
            <Column header="Mem" />
            <Column header="Disk" />
            <Column header="VGA" />
          </Row>
        </ColumnGroup>

        <Column
          field="eqpId"
          frozen
          class="font-bold bg-white dark:bg-slate-800"
          style="min-width: 120px"
        ></Column>

        <Column field="type" style="min-width: 100px"></Column>
        <Column field="systemModel" style="min-width: 120px"></Column>
        <Column field="application" style="min-width: 120px"></Column>
        <Column field="version" style="min-width: 80px"></Column>
        <Column field="dbVersion" style="min-width: 80px"></Column>
        <Column field="serialNum" style="min-width: 120px"></Column>

        <Column field="pcName" style="min-width: 120px"></Column>
        <Column field="ipAddress" style="min-width: 120px"></Column>
        <Column field="macAddress" style="min-width: 140px"></Column>
        <Column style="min-width: 180px">
          <template #body="{ data }">{{
            formatOS(data.os, data.systemType)
          }}</template>
        </Column>
        <Column field="locale" style="min-width: 80px"></Column>
        <Column style="min-width: 100px">
          <template #body="{ data }">{{
            formatTimezone(data.timezone)
          }}</template>
        </Column>

        <Column field="cpu" header="CPU" style="min-width: 200px">
          <template #body="{ data }">
            <div class="truncate" :title="data.cpu">{{ data.cpu }}</div>
          </template>
        </Column>

        <Column field="memory" style="min-width: 120px"></Column>

        <Column field="disk" header="Disk" style="min-width: 200px">
          <template #body="{ data }">
            <div class="truncate" :title="data.disk">{{ data.disk }}</div>
          </template>
        </Column>

        <Column field="vga" header="VGA" style="min-width: 200px">
          <template #body="{ data }">
            <div class="truncate" :title="data.vga">{{ data.vga }}</div>
          </template>
        </Column>
        <Column style="min-width: 120px">
          <template #body="{ data }">{{
            formatDate(data.lastContact)
          }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { equipmentApi, type EquipmentSpecDto } from "@/api/equipment";

// UI
import Dropdown from "primevue/dropdown";
import AutoComplete from "primevue/autocomplete";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup";
import Row from "primevue/row";

const selectedSite = ref("");
const selectedSdwt = ref("");
const selectedEqpId = ref("");
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const eqpIds = ref<string[]>([]);
const filteredEqpIds = ref<string[]>([]);
const equipmentList = ref<EquipmentSpecDto[]>([]);
const isLoading = ref(false);

onMounted(async () => {
  sites.value = await dashboardApi.getSites();
});

const onSiteChange = async () => {
  selectedSdwt.value = "";
  selectedEqpId.value = "";
  if (selectedSite.value) {
    sdwts.value = await dashboardApi.getSdwts(selectedSite.value);
    eqpIds.value = await equipmentApi.getEqpIds(selectedSite.value);
    loadData();
  } else {
    sdwts.value = [];
    equipmentList.value = [];
  }
};

const onSdwtChange = async () => {
  selectedEqpId.value = "";
  if (selectedSdwt.value) {
    eqpIds.value = await equipmentApi.getEqpIds(undefined, selectedSdwt.value);
  } else if (selectedSite.value) {
    eqpIds.value = await equipmentApi.getEqpIds(selectedSite.value);
  }
  loadData();
};

const searchEqpId = (event: any) => {
  filteredEqpIds.value = eqpIds.value.filter((id) =>
    id.toLowerCase().includes(event.query.toLowerCase())
  );
};

const loadData = async () => {
  if (!selectedSite.value) return;
  isLoading.value = true;
  try {
    equipmentList.value = await equipmentApi.getDetails(
      selectedSite.value,
      selectedSdwt.value,
      selectedEqpId.value
    );
  } finally {
    isLoading.value = false;
  }
};

const formatOS = (os: string, sys: string) => {
  return `${os?.replace("Microsoft Windows", "Win") || ""} ${
    sys?.replace("-bit", "") || ""
  }`.trim();
};

const formatTimezone = (tz: string) => {
  if (!tz) return "";
  if (tz.includes("Korea")) return "KST";
  if (tz.includes("China")) return "CST";
  return tz;
};

const formatDate = (d: string | null) => (d ? d.substring(0, 10) : "-");
</script>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
  font-weight: 700;
  font-size: 0.8rem;
}
</style>
