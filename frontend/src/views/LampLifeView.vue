<!-- frontend/src/views/LampLifeView.vue -->
<template>
  <div
    class="flex flex-col h-full w-full font-sans transition-colors duration-500 bg-[#F8FAFC] dark:bg-[#09090B]"
  >
    <div class="flex items-center gap-2 px-1 mb-2 shrink-0">
      <div
        class="flex items-center justify-center w-8 h-8 bg-white border rounded-lg shadow-sm dark:bg-zinc-900 border-slate-100 dark:border-zinc-800"
      >
        <i class="text-lg text-amber-500 pi pi-bolt dark:text-amber-400"></i>
      </div>
      <div class="flex items-baseline gap-2">
        <h1
          class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          Lamp Lifetime
        </h1>
        <span
          class="text-slate-400 dark:text-slate-500 font-medium text-[11px]"
        >
          Consumable parts lifecycle monitoring.
        </span>
      </div>
    </div>

    <div
      class="mb-5 bg-white dark:bg-[#111111] p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm shrink-0 transition-colors duration-300"
    >
      <div class="flex flex-wrap items-center flex-1 gap-2 px-1 py-1">
        <div class="min-w-[140px] shrink-0">
          <Select
            v-model="filter.site"
            :options="sites"
            placeholder="Site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSiteChange"
          />
        </div>
        <div class="min-w-[160px] shrink-0">
          <Select
            v-model="filter.sdwt"
            :options="sdwts"
            placeholder="SDWT"
            :disabled="!filter.site"
            class="w-full custom-dropdown small"
            overlayClass="custom-dropdown-panel small"
            showClear
            @change="onSdwtChange"
          />
        </div>

        <div
          v-if="filter.status"
          class="flex items-center gap-2 px-3 py-1 ml-2 text-xs font-bold rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 animate-fade-in"
        >
          <i class="pi pi-filter text-[10px]"></i>
          Filtered by: {{ filter.status }}
          <button
            @click="setStatusFilter(null)"
            class="ml-1 hover:text-rose-500"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
      <div
        class="flex items-center gap-1 pl-2 ml-auto border-l border-slate-100 dark:border-zinc-800"
      >
        <Button
          icon="pi pi-search"
          rounded
          class="!bg-amber-500 !border-amber-500 hover:!bg-amber-600 !w-8 !h-8 !text-xs"
          @click="fetchData"
          :loading="isLoading"
          :disabled="!filter.site || !filter.sdwt"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          severity="secondary"
          v-tooltip.left="'Reset'"
          @click="reset"
          class="!w-7 !h-7 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4 shrink-0 animate-fade-in"
    >
      <div
        @click="setStatusFilter(null)"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all duration-200"
        :class="{
          'ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-zinc-950':
            filter.status === null,
        }"
      >
        <p
          class="text-[10px] font-bold tracking-wider uppercase text-slate-400"
        >
          Total Monitored
        </p>
        <div class="flex items-end gap-2 mt-1">
          <span class="text-2xl font-black text-slate-800 dark:text-white">{{
            kpi.total.toLocaleString()
          }}</span>
          <span class="mb-1 text-[10px] text-slate-400">units</span>
        </div>
        <div class="absolute right-2 top-2 opacity-10">
          <i class="text-4xl text-slate-500 pi pi-list"></i>
        </div>
      </div>

      <div
        @click="setStatusFilter('Critical')"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-rose-200 dark:border-rose-900/30 rounded-xl group hover:scale-[1.02] transition-all duration-200"
        :class="{
          'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-zinc-950':
            filter.status === 'Critical',
        }"
      >
        <div
          class="absolute inset-0 transition-opacity opacity-50 bg-rose-50 dark:bg-rose-900/10 group-hover:opacity-100"
        ></div>
        <div class="relative z-10">
          <p
            class="text-[10px] font-bold tracking-wider uppercase text-rose-500 dark:text-rose-400 flex items-center gap-1"
          >
            <i class="pi pi-exclamation-triangle"></i> Critical / Replace
          </p>
          <div class="flex items-end gap-2 mt-1">
            <span
              class="text-2xl font-black text-rose-600 dark:text-rose-400"
              >{{ kpi.critical.toLocaleString() }}</span
            >
            <span class="mb-1 text-[10px] text-rose-400/70">units</span>
          </div>
        </div>
      </div>

      <div
        @click="setStatusFilter('Warning')"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-amber-200 dark:border-amber-900/30 rounded-xl hover:scale-[1.02] transition-all duration-200"
        :class="{
          'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-950':
            filter.status === 'Warning',
        }"
      >
        <p
          class="text-[10px] font-bold tracking-wider uppercase text-amber-500 dark:text-amber-400"
        >
          Warning Zone
        </p>
        <div class="flex items-end gap-2 mt-1">
          <span
            class="text-2xl font-black text-amber-600 dark:text-amber-400"
            >{{ kpi.warning.toLocaleString() }}</span
          >
          <span class="mb-1 text-[10px] text-amber-400/70">units</span>
        </div>
      </div>

      <div
        @click="setStatusFilter('Good')"
        class="relative p-4 overflow-hidden bg-white border shadow-sm cursor-pointer dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl hover:scale-[1.02] transition-all duration-200"
        :class="{
          'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950':
            filter.status === 'Good',
        }"
      >
        <p
          class="text-[10px] font-bold tracking-wider uppercase text-emerald-500 dark:text-emerald-400"
        >
          Healthy
        </p>
        <div class="flex items-end gap-2 mt-1">
          <span
            class="text-2xl font-black text-emerald-600 dark:text-emerald-400"
            >{{ kpi.good.toLocaleString() }}</span
          >
          <span class="mb-1 text-[10px] text-emerald-400/70">units</span>
        </div>
      </div>
    </div>

    <div
      v-if="hasSearched"
      class="flex flex-col h-[625px] shrink-0 lg:flex-row gap-4 overflow-hidden animate-fade-in"
    >
      <div
        class="flex flex-col w-full lg:w-1/3 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-zinc-800"
        >
          <h3
            class="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            <i class="pi pi-chart-bar text-rose-500"></i> Worst 10 Lamps
          </h3>
          <span class="text-[10px] text-slate-400"
            >*Global Ranking (Top 10)</span
          >
        </div>
        <div class="relative flex-1 w-full min-h-0">
          <EChart v-if="chartData.length > 0" :option="chartOption" />
          <div
            v-else
            class="flex items-center justify-center h-full text-xs text-slate-400"
          >
            No data available
          </div>
        </div>
      </div>

      <div
        class="flex flex-col flex-1 w-full lg:w-2/3 overflow-hidden bg-white border shadow-sm dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-xl"
      >
        <div
          class="flex items-center justify-between px-4 py-2 border-b bg-slate-50 dark:bg-zinc-900/50 border-slate-100 dark:border-zinc-800 shrink-0"
        >
          <div class="flex items-center gap-2">
            <i class="text-slate-400 pi pi-list"></i>
            <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Lamp Status Details
            </h3>
          </div>
          <span class="text-[10px] text-slate-400"
            >{{ filteredLamps.length }} records</span
          >
        </div>

        <div class="relative w-full flex-1 min-h-0">
          <DataTable
            :value="filteredLamps"
            :paginator="false"
            class="absolute inset-0 text-xs p-datatable-sm custom-header-group"
            stripedRows
            scrollable
            scrollHeight="flex"
            removableSort
            sortField="eqpId"
            :sortOrder="1"
          >
            <template #empty>
              <div
                class="flex flex-col items-center justify-center h-full text-slate-400"
              >
                <span class="text-xs">No lamp data found.</span>
              </div>
            </template>

            <Column
              field="eqpId"
              header="EQP ID"
              sortable
              style="min-width: 100px"
            >
              <template #body="{ data }">
                <span class="font-bold text-slate-700 dark:text-slate-200">{{
                  data.eqpId
                }}</span>
              </template>
            </Column>

            <Column
              field="lampId"
              header="Lamp ID"
              sortable
              style="min-width: 100px"
            >
              <template #body="{ data }">
                <span class="font-mono text-slate-700 dark:text-slate-200">{{
                  data.lampId
                }}</span>
              </template>
            </Column>

            <Column
              field="lastChanged"
              header="Last Changed"
              sortable
              style="min-width: 120px"
            >
              <template #body="{ data }">
                <span class="font-mono text-slate-500">{{
                  data.lastChanged || "-"
                }}</span>
              </template>
            </Column>

            <Column
              field="usageRatio"
              header="Life Usage"
              sortable
              style="min-width: 200px"
            >
              <template #body="{ data }">
                <div class="flex flex-col gap-1 w-full">
                  <div class="flex justify-between text-[10px]">
                    <span class="font-mono"
                      >{{ data.ageHour.toLocaleString() }} hrs</span
                    >
                    <span class="text-slate-400"
                      >Limit: {{ data.lifespanHour.toLocaleString() }}</span
                    >
                  </div>
                  <div
                    class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="getProgressColor(data.usageRatio)"
                      :style="{ width: Math.min(data.usageRatio, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </template>
            </Column>

            <Column
              field="status"
              header="Status"
              sortable
              style="min-width: 100px"
              alignFrozen="right"
              frozen
            >
              <template #body="{ data }">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold border"
                  :class="getStatusBadgeClass(data.status)"
                >
                  {{ data.status }}
                </span>
              </template>
            </Column>
          </DataTable>
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
        <i
          class="text-4xl text-slate-300 dark:text-zinc-600 pi pi-hourglass"
        ></i>
      </div>
      <p class="text-sm font-bold text-slate-500">Lamp Health Check</p>
      <p class="mt-1 text-xs text-slate-400">
        Select Site/SDWT to view lamp status.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { dashboardApi } from "@/api/dashboard";
import { lampApi, type LampLifeDto } from "@/api/lamp";
import EChart from "@/components/common/EChart.vue";

// Components
import Select from "primevue/select";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

interface LampDisplay extends LampLifeDto {
  usageRatio: number;
  status: string;
}

// --- State ---
const filter = reactive({
  site: "",
  sdwt: "",
  status: null as string | null,
});

const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const allLamps = ref<LampDisplay[]>([]);
const isLoading = ref(false);
const hasSearched = ref(false);

const isDarkMode = ref(document.documentElement.classList.contains("dark"));
let themeObserver: MutationObserver | null = null;

// --- Lifecycle ---
onMounted(async () => {
  sites.value = await dashboardApi.getSites();

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

  const savedSite = localStorage.getItem("lamp_site");
  if (savedSite && sites.value.includes(savedSite)) {
    filter.site = savedSite;
    sdwts.value = await dashboardApi.getSdwts(savedSite);
    const savedSdwt = localStorage.getItem("lamp_sdwt");
    if (savedSdwt) filter.sdwt = savedSdwt;
  }
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
});

// --- Handlers ---
const onSiteChange = async () => {
  if (filter.site) {
    localStorage.setItem("lamp_site", filter.site);
    sdwts.value = await dashboardApi.getSdwts(filter.site);
  } else {
    localStorage.removeItem("lamp_site");
    sdwts.value = [];
  }
  filter.sdwt = "";
  localStorage.removeItem("lamp_sdwt");
};

const onSdwtChange = () => {
  if (filter.sdwt) localStorage.setItem("lamp_sdwt", filter.sdwt);
  else localStorage.removeItem("lamp_sdwt");
};

const setStatusFilter = (status: string | null) => {
  if (filter.status === status) {
    filter.status = null;
  } else {
    filter.status = status;
  }
};

const fetchData = async () => {
  isLoading.value = true;
  hasSearched.value = true;
  try {
    const res = await lampApi.getData(filter.site, filter.sdwt);

    allLamps.value = res.map((l: LampLifeDto) => ({
      ...l,
      usageRatio: l.lifespanHour > 0 ? (l.ageHour / l.lifespanHour) * 100 : 0,
      status: getStatus(l.ageHour, l.lifespanHour),
    }));
  } catch (e) {
    console.error(e);
    allLamps.value = [];
  } finally {
    isLoading.value = false;
  }
};

const reset = () => {
  hasSearched.value = false;
  filter.site = "";
  filter.sdwt = "";
  filter.status = null;
  allLamps.value = [];
  localStorage.removeItem("lamp_site");
  localStorage.removeItem("lamp_sdwt");
};

// --- Logic ---
const getStatus = (age: number, lifespan: number) => {
  const ratio = lifespan > 0 ? age / lifespan : 0;
  if (ratio >= 1.0) return "Critical";
  if (ratio >= 0.95) return "Critical";
  if (ratio >= 0.8) return "Warning";
  return "Good";
};

const filteredLamps = computed(() => {
  let data = [...allLamps.value];
  if (filter.status) {
    data = data.filter((d) => d.status === filter.status);
  }
  return data;
});

const kpi = computed(() => {
  return {
    total: allLamps.value.length,
    critical: allLamps.value.filter((d) => d.status === "Critical").length,
    warning: allLamps.value.filter((d) => d.status === "Warning").length,
    good: allLamps.value.filter((d) => d.status === "Good").length,
  };
});

const chartData = computed(() => {
  return [...allLamps.value]
    .sort((a, b) => b.usageRatio - a.usageRatio)
    .slice(0, 10);
});

const chartOption = computed(() => {
  const textColor = isDarkMode.value ? "#cbd5e1" : "#475569";
  const data = chartData.value;

  const categories = data.map((d) => `${d.eqpId} (${d.lampId})`);
  const values = data.map((d) => d.usageRatio);

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        if (!params || !params[0]) return "";
        const i = params[0].dataIndex;
        const item = data[i];
        if (!item) return "";

        return `
                    <div class="font-bold mb-1">${
                      item.eqpId
                    } <span style="font-weight:normal; opacity:0.7">(${
          item.lampId
        })</span></div>
                    <div class="text-xs">Age: ${item.ageHour} / ${
          item.lifespanHour
        } hrs</div>
                    <div class="text-xs font-bold mt-1">Ratio: ${item.usageRatio.toFixed(
                      2
                    )}%</div>
                `;
      },
    },
    grid: {
      containLabel: true,
      left: "2%",
      right: "5%",
      top: 10,
      bottom: 10,
    },
    xAxis: {
      type: "value",
      min: (value: any) => Math.max(0, Math.floor(value.min - 5)),
      axisLabel: { color: textColor, fontSize: 10, formatter: "{value}%" },
      splitLine: { show: false },
    },
    yAxis: {
      type: "category",
      data: categories,
      axisLabel: {
        color: textColor,
        fontSize: 10,
        align: "right",
        margin: 10,
      },
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "bar",
        data: values,
        barWidth: 20,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: (params: any) => {
            const val = params.value;
            if (val >= 95) return "#f43f5e";
            if (val >= 80) return "#f59e0b";
            return "#10b981";
          },
        },
        label: {
          show: true,
          position: "insideRight",
          formatter: (params: any) => `${params.value.toFixed(2)}%`,
          fontSize: 10,
          color: "#fff",
          fontWeight: "bold",
          padding: [0, 5, 0, 0],
        },
      },
    ],
  };
});

// --- UI Helpers ---
const getProgressColor = (ratio: number) => {
  if (ratio >= 95) return "bg-rose-500";
  if (ratio >= 80) return "bg-amber-500";
  return "bg-emerald-500";
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Critical":
      return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30";
    case "Warning":
      return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30";
    case "Good":
      return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
};
</script>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
  @apply font-extrabold text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 uppercase tracking-wider py-3 border-b border-slate-200 dark:border-zinc-700 z-10 sticky top-0;
}
:deep(.p-datatable-tbody > tr > td) {
  @apply py-2 px-3 text-[12px] text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-zinc-800/50;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  @apply !bg-[#27272a] !text-white;
}

:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-lg font-bold shadow-none transition-colors;
}
:deep(.custom-dropdown .p-select-label) {
  @apply text-[13px] py-[5px] px-3;
}
:deep(.custom-dropdown.small) {
  @apply h-7;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-6 !bg-transparent !border-0 !shadow-none;
}
:deep(.p-select-dropdown svg) {
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
</style>
