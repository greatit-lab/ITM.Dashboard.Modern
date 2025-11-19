<template>
  <div
    class="p-8 min-h-screen transition-colors duration-500 ease-in-out bg-[#F3F4F6] dark:bg-[#09090B] font-sans"
  >
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6"
    >
      <div>
        <h1
          class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-3"
        >
          Dashboard
          <span
            class="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold tracking-wide uppercase border border-indigo-200 dark:border-indigo-500/20"
            >Live</span
          >
        </h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">
          Overview of system performance.
        </p>
      </div>

      <button
        @click="toggleDarkMode"
        class="relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none border-2"
        :class="
          isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-200 border-gray-300'
        "
      >
        <span class="sr-only">Toggle Dark Mode</span>
        <span
          class="h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center z-10"
          :class="isDark ? 'translate-x-[30px]' : 'translate-x-1'"
        >
          <i
            class="pi text-[10px]"
            :class="
              isDark ? 'pi-moon text-indigo-500' : 'pi-sun text-amber-500'
            "
          ></i>
        </span>
      </button>
    </div>

    <div
      class="sticky top-4 z-30 mb-8 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between transition-all duration-300"
    >
      <div class="flex gap-2 flex-1 overflow-x-auto px-1">
        <div class="min-w-[200px]">
          <Dropdown
            v-model="selectedSite"
            :options="sites"
            placeholder="All Sites"
            class="w-full !rounded-xl !border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-white/5 !text-sm !font-semibold !text-gray-700 dark:!text-gray-200 !shadow-none"
            showClear
            @change="onSiteChanged"
          />
        </div>
        <div class="w-px h-6 bg-gray-300 dark:bg-zinc-700 my-auto"></div>
        <div class="min-w-[200px]">
          <Dropdown
            v-model="selectedSdwt"
            :options="sdwts"
            placeholder="All SDWT"
            class="w-full !rounded-xl !border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-white/5 !text-sm !font-semibold !text-gray-700 dark:!text-gray-200 !shadow-none"
            :disabled="!selectedSite"
            showClear
            @change="onSdwtChange"
          />
        </div>
      </div>
      <Button
        icon="pi pi-sync"
        rounded
        text
        severity="secondary"
        @click="loadData"
        v-tooltip.left="'Refresh'"
        class="!w-9 !h-9 !text-gray-400 hover:!text-indigo-600 dark:hover:!text-indigo-400 hover:!bg-indigo-50 dark:hover:!bg-indigo-900/20"
      />
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col justify-center items-center h-80"
    >
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="3" />
      <p
        class="mt-4 text-gray-400 animate-pulse text-xs font-bold tracking-wider uppercase"
      >
        Loading Data...
      </p>
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          @click="activeFilter = 'All'"
          class="group relative h-32 rounded-[2rem] cursor-pointer transition-all duration-300 overflow-hidden border"
          :class="
            activeFilter === 'All'
              ? 'bg-gradient-to-br from-indigo-500 to-blue-600 border-transparent shadow-lg shadow-indigo-500/30 transform -translate-y-1'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700'
          "
        >
          <div class="relative z-10 h-full flex flex-col justify-between p-6">
            <div class="flex justify-between items-start">
              <p
                class="text-[10px] font-extrabold uppercase tracking-widest"
                :class="
                  activeFilter === 'All'
                    ? 'text-white/80'
                    : 'text-gray-400 dark:text-zinc-500'
                "
              >
                Total Agents
              </p>
            </div>
            <p
              class="text-4xl font-black tracking-tighter"
              :class="
                activeFilter === 'All'
                  ? 'text-white'
                  : 'text-gray-800 dark:text-white'
              "
            >
              {{ summary.totalEqpCount }}
            </p>
          </div>

          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
            :class="
              activeFilter === 'All'
                ? 'bg-white/20 backdrop-blur-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
            "
          >
            <i
              class="pi pi-desktop text-2xl"
              :class="activeFilter === 'All' ? 'text-white' : ''"
            ></i>
          </div>
          <div
            v-if="activeFilter === 'All'"
            class="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          ></div>
        </div>

        <div
          @click="activeFilter = 'Online'"
          class="group relative h-32 rounded-[2rem] cursor-pointer transition-all duration-300 overflow-hidden border"
          :class="
            activeFilter === 'Online'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent shadow-lg shadow-emerald-500/30 transform -translate-y-1'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700'
          "
        >
          <div class="relative z-10 h-full flex flex-col justify-between p-6">
            <p
              class="text-[10px] font-extrabold uppercase tracking-widest"
              :class="
                activeFilter === 'Online'
                  ? 'text-white/80'
                  : 'text-gray-400 dark:text-zinc-500'
              "
            >
              Online
            </p>
            <p
              class="text-4xl font-black tracking-tighter"
              :class="
                activeFilter === 'Online'
                  ? 'text-white'
                  : 'text-gray-800 dark:text-white'
              "
            >
              {{ summary.onlineAgentCount }}
            </p>
          </div>

          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
            :class="
              activeFilter === 'Online'
                ? 'bg-white/20 backdrop-blur-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
            "
          >
            <i
              class="pi pi-wifi text-2xl"
              :class="activeFilter === 'Online' ? 'text-white' : ''"
            ></i>
          </div>
          <div
            v-if="activeFilter === 'Online'"
            class="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          ></div>
        </div>

        <div
          @click="activeFilter = 'Offline'"
          class="group relative h-32 rounded-[2rem] cursor-pointer transition-all duration-300 overflow-hidden border"
          :class="
            activeFilter === 'Offline'
              ? 'bg-gradient-to-br from-rose-500 to-red-600 border-transparent shadow-lg shadow-rose-500/30 transform -translate-y-1'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700'
          "
        >
          <div class="relative z-10 h-full flex flex-col justify-between p-6">
            <p
              class="text-[10px] font-extrabold uppercase tracking-widest"
              :class="
                activeFilter === 'Offline'
                  ? 'text-white/80'
                  : 'text-gray-400 dark:text-zinc-500'
              "
            >
              Offline
            </p>
            <p
              class="text-4xl font-black tracking-tighter"
              :class="
                activeFilter === 'Offline'
                  ? 'text-white'
                  : 'text-gray-800 dark:text-white'
              "
            >
              {{ summary.totalEqpCount - summary.onlineAgentCount }}
            </p>
          </div>

          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
            :class="
              activeFilter === 'Offline'
                ? 'bg-white/20 backdrop-blur-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
            "
          >
            <i
              class="pi pi-ban text-2xl"
              :class="activeFilter === 'Offline' ? 'text-white' : ''"
            ></i>
          </div>
          <div
            v-if="activeFilter === 'Offline'"
            class="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          ></div>
        </div>

        <div
          @click="activeFilter = 'Alarm'"
          class="group relative h-32 rounded-[2rem] cursor-pointer transition-all duration-300 overflow-hidden border"
          :class="
            activeFilter === 'Alarm'
              ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-transparent shadow-lg shadow-amber-500/30 transform -translate-y-1'
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700'
          "
        >
          <div class="relative z-10 h-full flex flex-col justify-between p-6">
            <p
              class="text-[10px] font-extrabold uppercase tracking-widest"
              :class="
                activeFilter === 'Alarm'
                  ? 'text-white/80'
                  : 'text-gray-400 dark:text-zinc-500'
              "
            >
              Alerts
            </p>
            <div class="flex items-baseline gap-2">
              <p
                class="text-4xl font-black tracking-tighter"
                :class="
                  activeFilter === 'Alarm'
                    ? 'text-white'
                    : 'text-gray-800 dark:text-white'
                "
              >
                {{ summary.todayErrorCount }}
              </p>
              <span
                v-if="summary.newAlarmCount > 0"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/30 text-white border border-white/20"
              >
                +{{ summary.newAlarmCount }}
              </span>
            </div>
          </div>

          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300"
            :class="
              activeFilter === 'Alarm'
                ? 'bg-white/20 backdrop-blur-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600'
            "
          >
            <i
              class="pi pi-exclamation-triangle text-2xl"
              :class="activeFilter === 'Alarm' ? 'text-white' : ''"
            ></i>
          </div>
          <div
            v-if="activeFilter === 'Alarm'"
            class="absolute -right-6 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          ></div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
      >
        <div
          class="p-6 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50"
        >
          <div class="flex items-center gap-3">
            <div class="w-1.5 h-5 bg-indigo-500 rounded-full"></div>
            <h3
              class="font-bold text-base text-gray-700 dark:text-gray-200 tracking-tight"
            >
              Agent Status
            </h3>
          </div>
          <span class="flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
            ></span>
          </span>
        </div>

        <DataTable
          :value="filteredAgents"
          :paginator="true"
          :rows="10"
          class="p-datatable-lg"
          :rowHover="true"
        >
          <template #empty>
            <div
              class="flex flex-col items-center justify-center py-12 text-gray-400"
            >
              <i class="pi pi-filter text-3xl mb-3 opacity-20"></i>
              <p class="text-xs font-medium">No match found.</p>
            </div>
          </template>

          <Column field="isOnline" header="STATUS" style="width: 100px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="
                    data.isOnline
                      ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                      : 'bg-gray-300 dark:bg-zinc-700'
                  "
                ></div>
                <span
                  class="text-[11px] font-bold tracking-wide"
                  :class="
                    data.isOnline
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400 dark:text-zinc-500'
                  "
                  >{{ data.isOnline ? "ONLINE" : "OFFLINE" }}</span
                >
              </div>
            </template>
          </Column>

          <Column field="eqpId" header="EQP ID" sortable>
            <template #body="{ data }">
              <span
                class="font-bold text-gray-700 dark:text-gray-200 text-sm"
                >{{ data.eqpId }}</span
              >
            </template>
          </Column>

          <Column
            field="type"
            header="TYPE"
            class="text-gray-500 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider"
          ></Column>
          <Column
            field="pcName"
            header="HOST"
            class="text-gray-500 dark:text-zinc-400 text-xs font-medium"
          ></Column>

          <Column header="RESOURCES" style="width: 220px">
            <template #body="{ data }">
              <div
                class="flex flex-col gap-1.5 cursor-pointer group opacity-80 hover:opacity-100 transition-opacity"
                @click="openChart(data)"
              >
                <div
                  class="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-zinc-500"
                >
                  <span class="w-6">CPU</span>
                  <div
                    class="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-indigo-500 rounded-full"
                      :style="{ width: data.cpuUsage + '%' }"
                    ></div>
                  </div>
                  <span class="w-8 text-right text-gray-600 dark:text-gray-400"
                    >{{ data.cpuUsage.toFixed(0) }}%</span
                  >
                </div>
                <div
                  class="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-zinc-500"
                >
                  <span class="w-6">MEM</span>
                  <div
                    class="flex-1 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-purple-500 rounded-full"
                      :style="{ width: data.memoryUsage + '%' }"
                    ></div>
                  </div>
                  <span class="w-8 text-right text-gray-600 dark:text-gray-400"
                    >{{ data.memoryUsage.toFixed(0) }}%</span
                  >
                </div>
              </div>
            </template>
          </Column>

          <Column field="lastContact" header="LAST SEEN" sortable>
            <template #body="{ data }">
              <span
                class="text-xs text-gray-400 dark:text-zinc-500 font-mono"
                >{{ formatDate(data.lastContact) }}</span
              >
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog
      v-model:visible="showChart"
      modal
      :header="(selectedAgentId || '') + ' Analytics'"
      :style="{ width: '80vw' }"
      class="backdrop-blur-xl"
    >
      <div
        class="h-[500px] w-full bg-white dark:bg-zinc-950 rounded-xl p-4 border border-gray-100 dark:border-zinc-800"
      >
        <AmChart
          v-if="chartData.length > 0"
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="chartConfig"
          height="100%"
          :isDarkMode="isDark"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  dashboardApi,
  type DashboardSummaryDto,
  type AgentStatusDto,
} from "@/api/dashboard";
import AmChart from "@/components/common/AmChart.vue";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const isDark = ref(
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);
if (isDark.value) document.documentElement.classList.add("dark");
else document.documentElement.classList.remove("dark");

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }
};

const isLoading = ref(true);
const isTableLoading = ref(false);
const activeFilter = ref<"All" | "Online" | "Offline" | "Alarm">("All");
const selectedSite = ref("");
const selectedSdwt = ref("");
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const summary = ref<DashboardSummaryDto>({
  totalEqpCount: 0,
  onlineAgentCount: 0,
  todayErrorCount: 0,
  todayDataCount: 0,
  newAlarmCount: 0,
});
const agentList = ref<AgentStatusDto[]>([]);
const showChart = ref(false);
const selectedAgentId = ref<string | null>(null);
const chartData = ref<any[]>([]);
const chartConfig = {
  xField: "timestamp",
  xTimeUnit: "minute",
  xAxisDateFormat: "MM-dd HH:mm",
  series: [
    {
      name: "CPU",
      valueField: "cpuUsage",
      color: "#6366f1",
      tooltipText: "{valueY}%",
    },
    {
      name: "Memory",
      valueField: "memoryUsage",
      color: "#a855f7",
      tooltipText: "{valueY}%",
    },
  ],
};

const filteredAgents = computed(() => {
  switch (activeFilter.value) {
    case "Online":
      return agentList.value.filter((a) => a.isOnline);
    case "Offline":
      return agentList.value.filter((a) => !a.isOnline);
    case "Alarm":
      return agentList.value.filter((a) => a.todayAlarmCount > 0);
    default:
      return agentList.value;
  }
});

onMounted(async () => {
  try {
    sites.value = await dashboardApi.getSites();
    await loadData();
  } finally {
    isLoading.value = false;
  }
});

const loadData = async () => {
  summary.value = await dashboardApi.getSummary(
    selectedSite.value,
    selectedSdwt.value
  );
  isTableLoading.value = true;
  try {
    agentList.value = await dashboardApi.getAgentStatus(
      selectedSite.value,
      selectedSdwt.value
    );
  } finally {
    isTableLoading.value = false;
  }
};

const onSiteChanged = async () => {
  selectedSdwt.value = "";
  sdwts.value = selectedSite.value
    ? await dashboardApi.getSdwts(selectedSite.value)
    : [];
  await loadData();
};
const onSdwtChange = async () => {
  await loadData();
};

const openChart = async (agent: AgentStatusDto) => {
  selectedAgentId.value = agent.eqpId;
  showChart.value = true;
  chartData.value = [];
  setTimeout(() => {
    chartData.value = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
    }));
  }, 500);
};

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString() : "-";
</script>

<style scoped>
/* Table Styles */
:deep(.p-datatable .p-datatable-header) {
  background: transparent;
  border: none;
  padding: 0;
}
:deep(.p-column-header-content) {
  color: #94a3b8;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  font-weight: 800;
}
:deep(.dark .p-column-header-content) {
  color: #52525b;
}

:deep(.p-datatable-tbody > tr) {
  background: transparent !important;
  border-bottom: 1px solid #f1f5f9;
}
:deep(.dark .p-datatable-tbody > tr) {
  border-bottom: 1px solid #18181b;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f8fafc !important;
}
:deep(.dark .p-datatable-tbody > tr:hover) {
  background-color: #09090b !important;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 1.5rem;
}
</style>
