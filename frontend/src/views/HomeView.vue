<template>
  <div
    class="min-h-full transition-colors duration-500 ease-in-out bg-[#F8FAFC] dark:bg-[#09090B] font-sans"
  >
    <div
      class="flex flex-col md:flex-row justify-between items-center mb-5 gap-4"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-slate-100 dark:border-zinc-800"
        >
          <i class="pi pi-objects-column text-2xl text-indigo-500"></i>
        </div>
        <div>
          <h1
            class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2"
          >
            Overview
            <span
              v-if="hasSearched"
              class="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold tracking-wide uppercase border border-indigo-200 dark:border-indigo-500/20 fade-in"
              >Live</span
            >
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-xs">
            System performance summary.
          </p>
        </div>
      </div>
    </div>

    <div
      class="mb-6 bg-white dark:bg-[#111111] p-2 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-wrap gap-2 items-center justify-between shadow-sm"
    >
      <div class="flex gap-2 flex-1 overflow-x-auto px-1">
        <div class="min-w-[200px]">
          <Select
            v-model="selectedSite"
            :options="sites"
            placeholder="Select Site"
            class="w-full custom-dropdown"
            :class="{ '!text-slate-400': !selectedSite }"
            showClear
            @change="onSiteChanged"
          />
        </div>
        <div class="min-w-[200px]">
          <Select
            v-model="selectedSdwt"
            :options="sdwts"
            placeholder="Select SDWT"
            class="w-full custom-dropdown"
            :class="{ '!text-slate-400': !selectedSdwt }"
            :disabled="!selectedSite"
            showClear
            @change="onSdwtChange"
          />
        </div>
      </div>

      <div class="flex items-center gap-1 pr-2">
        <div v-if="hasSearched" class="flex items-center justify-center w-8">
          <span
            class="text-xs font-bold font-mono text-slate-400 dark:text-slate-500"
            >{{ refreshCount }}s</span
          >
        </div>
        <Button
          icon="pi pi-sync"
          rounded
          text
          severity="secondary"
          @click="manualRefresh"
          :disabled="!hasSearched"
          v-tooltip.left="'Refresh Now'"
          class="!w-8 !h-8 !text-slate-400 hover:!text-slate-600 dark:!text-zinc-500 dark:hover:!text-zinc-300 transition-colors"
        />
      </div>
    </div>

    <div
      v-if="!hasSearched"
      class="flex flex-col justify-center items-center h-80 fade-in border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl"
    >
      <div
        class="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-3 text-slate-400 dark:text-zinc-500"
      >
        <i class="pi pi-search text-xl"></i>
      </div>
      <h3 class="text-base font-bold text-slate-700 dark:text-slate-200">
        Ready to Analyze
      </h3>
      <p class="text-slate-500 dark:text-slate-500 text-xs mt-1">
        Please select a <b>Site</b> and <b>SDWT</b> to view the dashboard.
      </p>
    </div>

    <div v-else class="space-y-6 fade-in">
      <div
        v-if="isSummaryLoading"
        class="flex flex-col justify-center items-center h-24"
      >
        <ProgressSpinner style="width: 25px; height: 25px" strokeWidth="4" />
        <p class="text-xs text-slate-400 mt-2">Loading Summary...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          @click="setActiveFilter('All')"
          class="relative h-24 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'All'
              ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-indigo-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'All'
                    ? 'text-indigo-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Total Agents
              </p>
              <p
                class="text-3xl font-black tracking-tight"
                :class="
                  activeFilter === 'All'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.totalEqpCount }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="
                activeFilter === 'All'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-indigo-500'
              "
            >
              <i class="pi pi-server text-2xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Online')"
          class="relative h-24 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'Online'
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-emerald-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Online'
                    ? 'text-emerald-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Online
              </p>
              <p
                class="text-3xl font-black tracking-tight"
                :class="
                  activeFilter === 'Online'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white'
                "
              >
                {{ summary.onlineAgentCount }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="
                activeFilter === 'Online'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-emerald-500'
              "
            >
              <i class="pi pi-wifi text-2xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Offline')"
          class="relative h-24 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'Offline'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 ring-2 ring-offset-2 ring-rose-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-rose-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Offline'
                    ? 'text-rose-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Offline
              </p>
              <p
                class="text-3xl font-black tracking-tight"
                :class="[
                  activeFilter === 'Offline'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'Offline' &&
                  summary.totalEqpCount - summary.onlineAgentCount > 0
                    ? '!text-rose-500'
                    : '',
                ]"
              >
                {{ summary.totalEqpCount - summary.onlineAgentCount }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="
                activeFilter === 'Offline'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-rose-500'
              "
            >
              <i class="pi pi-ban text-2xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('Alarm')"
          class="relative h-24 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'Alarm'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-offset-2 ring-amber-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-amber-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'Alarm'
                    ? 'text-amber-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Alerts
              </p>
              <div class="flex items-baseline gap-2">
                <p
                  class="text-3xl font-black tracking-tight"
                  :class="
                    activeFilter === 'Alarm'
                      ? 'text-white'
                      : 'text-slate-700 dark:text-white'
                  "
                >
                  {{ summary.todayErrorCount }}
                </p>
                <span
                  v-if="summary.newAlarmCount > 0"
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  :class="
                    activeFilter === 'Alarm'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  "
                  >+{{ summary.newAlarmCount }}</span
                >
              </div>
            </div>
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="
                activeFilter === 'Alarm'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-amber-500'
              "
            >
              <i class="pi pi-bell text-2xl"></i>
            </div>
          </div>
        </div>

        <div
          @click="setActiveFilter('TimeSync')"
          class="relative h-24 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 border overflow-hidden"
          :class="[
            activeFilter === 'TimeSync'
              ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20 ring-2 ring-offset-2 ring-pink-500 dark:ring-offset-black border-transparent'
              : 'bg-white dark:bg-[#111111] border-slate-200 dark:border-zinc-800 hover:border-pink-400',
          ]"
        >
          <div class="flex justify-between items-center h-full relative z-10">
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                :class="
                  activeFilter === 'TimeSync'
                    ? 'text-pink-100'
                    : 'text-slate-500 dark:text-slate-400'
                "
              >
                Time Sync Err
              </p>
              <p
                class="text-3xl font-black tracking-tight"
                :class="[
                  activeFilter === 'TimeSync'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-white',
                  activeFilter !== 'TimeSync' && timeSyncErrorCount > 0
                    ? '!text-pink-500'
                    : '',
                ]"
              >
                {{ timeSyncErrorCount }}
              </p>
            </div>
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="
                activeFilter === 'TimeSync'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-50 dark:bg-zinc-800 text-pink-500'
              "
            >
              <i class="pi pi-clock text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden"
      >
        <DataTable
          :value="filteredAgents"
          :paginator="false"
          :rows="rowsPerPage"
          :first="first"
          class="p-datatable-sm text-sm"
          :rowHover="true"
          :loading="isTableLoading"
          stripedRows
        >
          <template #header>
            <div
              class="flex flex-col md:flex-row justify-between items-center gap-4 px-2 py-1"
            >
              <div class="flex items-center gap-3">
                <div class="w-1 h-4 bg-indigo-500 rounded-full"></div>
                <h3 class="font-bold text-base text-slate-800 dark:text-white">
                  Agent Status
                </h3>
              </div>

              <div
                class="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium">Rows:</span>
                  <select
                    v-model="rowsPerPage"
                    class="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    @change="first = 0"
                  >
                    <option :value="15">15</option>
                    <option :value="30">30</option>
                    <option :value="50">50</option>
                  </select>
                </div>

                <span class="font-medium text-xs min-w-[80px] text-right">
                  {{ totalRecords === 0 ? 0 : first + 1 }} -
                  {{ Math.min(first + rowsPerPage, totalRecords) }} of
                  {{ totalRecords }}
                </span>

                <div class="flex items-center gap-1">
                  <button
                    @click="first = 0"
                    :disabled="first === 0"
                    class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    <i class="pi pi-angle-double-left text-xs"></i>
                  </button>
                  <button
                    @click="prevPage"
                    :disabled="first === 0"
                    class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <i class="pi pi-angle-left text-xs"></i>
                  </button>
                  <button
                    @click="nextPage"
                    :disabled="first + rowsPerPage >= totalRecords"
                    class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <i class="pi pi-angle-right text-xs"></i>
                  </button>
                  <button
                    @click="lastPage"
                    :disabled="first + rowsPerPage >= totalRecords"
                    class="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    <i class="pi pi-angle-double-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template #empty>
            <div
              class="flex flex-col items-center justify-center py-16 text-gray-400"
            >
              <i class="pi pi-filter text-3xl mb-3 opacity-20"></i>
              <p class="text-xs font-medium">No match found.</p>
            </div>
          </template>

          <Column
            header="Connection"
            sortable
            field="isOnline"
            style="width: 120px"
            :bodyStyle="{ paddingLeft: '20px' }"
            headerStyle="padding-left: 20px"
          >
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors"
                :class="
                  data.isOnline
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                "
              >
                <i
                  :class="
                    data.isOnline
                      ? 'pi pi-check-circle'
                      : 'pi pi-exclamation-circle'
                  "
                  class="text-xs"
                ></i>
                {{ data.isOnline ? "Online" : "Offline" }}
              </span>
            </template>
          </Column>

          <Column header="Status" style="width: 120px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors"
                :class="getStatusBadgeClass(data)"
              >
                <i :class="getStatusIcon(data)" class="text-xs"></i>
                {{ getStatusLabel(data) }}
              </span>
            </template>
          </Column>

          <Column field="eqpId" header="EQP ID" sortable style="width: 120px">
            <template #body="{ data }"
              ><span class="font-bold text-slate-700 dark:text-slate-200">{{
                data.eqpId
              }}</span></template
            >
          </Column>
          <Column field="type" header="Type" sortable style="width: 80px">
            <template #body="{ data }"
              ><span class="text-slate-600 dark:text-slate-300">{{
                data.type
              }}</span></template
            >
          </Column>
          <Column field="ipAddress" header="IP Address" style="width: 120px">
            <template #body="{ data }"
              ><span class="text-slate-600 dark:text-slate-300">{{
                data.ipAddress
              }}</span></template
            >
          </Column>
          <Column field="pcName" header="PC Name" style="width: 150px">
            <template #body="{ data }"
              ><span class="text-slate-600 dark:text-slate-300">{{
                data.pcName
              }}</span></template
            >
          </Column>

          <Column header="Operating System(OS)" style="width: 180px">
            <template #body="{ data }">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex items-center justify-center w-6 h-6 rounded-md border text-xs transition-colors"
                  :class="getOsStyle(data.os).badge"
                >
                  <i class="pi pi-microsoft"></i>
                </span>
                <span class="truncate" :class="getOsStyle(data.os).text">{{
                  formatOperatingSystem(data.os, data.systemType)
                }}</span>
              </div>
            </template>
          </Column>

          <Column header="CPU / Memory" style="width: 180px">
            <template #body="{ data }">
              <div
                class="flex flex-col gap-1.5 cursor-pointer opacity-90 hover:opacity-100"
                @click="openChart(data)"
              >
                <div
                  class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 relative overflow-hidden"
                >
                  <div
                    class="bg-blue-500 h-full rounded-full"
                    :style="{ width: data.cpuUsage + '%' }"
                  ></div>
                </div>
                <div
                  class="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 relative overflow-hidden"
                >
                  <div
                    class="bg-teal-500 h-full rounded-full"
                    :style="{ width: data.memoryUsage + '%' }"
                  ></div>
                </div>
              </div>
            </template>
          </Column>

          <Column style="width: 100px">
            <template #header>
              <span
                v-tooltip.top="'+: Agent Fast\n-: Agent Slow'"
                class="cursor-help border-b border-dotted border-slate-400 dark:border-slate-600 whitespace-nowrap"
              >
                Time Diff
              </span>
            </template>
            <template #body="{ data }">
              <span
                class="text-slate-600 dark:text-slate-300"
                :class="getClockDriftColor(data.clockDrift)"
                >{{ formatTimeDifference(data.clockDrift) }}</span
              >
            </template>
          </Column>

          <Column
            field="lastContact"
            header="Last Contact"
            style="width: 160px"
          >
            <template #body="{ data }"
              ><span
                class="font-mono text-xs text-slate-600 dark:text-slate-300"
                >{{ formatDate(data.lastContact) }}</span
              ></template
            >
          </Column>

          <Column field="appVersion" header="Agent Ver" style="width: 100px">
            <template #body="{ data }">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors"
                :class="getAgentVerStyle(data.appVersion)"
              >
                <i class="pi pi-tag text-xs opacity-70"></i>
                {{ data.appVersion }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Dialog
      v-model:visible="showChart"
      modal
      :header="
        (selectedAgentId || '') + ' 호기 Performance Trend (Last 24 Hours)'
      "
      :style="{ width: '80vw' }"
      class="backdrop-blur-xl"
      :dismissableMask="true"
    >
      <div
        class="h-[500px] w-full bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-100 dark:border-zinc-800"
      >
        <AmChart
          v-if="chartData.length > 0"
          chartType="PerformanceLineChart"
          :data="chartData"
          :config="chartConfig"
          height="100%"
          :isDarkMode="false"
        />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  dashboardApi,
  type DashboardSummaryDto,
  type AgentStatusDto,
} from "@/api/dashboard";
import AmChart from "@/components/common/AmChart.vue";
import Select from "primevue/select";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import ProgressSpinner from "primevue/progressspinner";

const isSummaryLoading = ref(false);
const isTableLoading = ref(false);
const hasSearched = ref(false);

const activeFilter = ref<"All" | "Online" | "Offline" | "Alarm" | "TimeSync">(
  "All"
);
const selectedSite = ref("");
const selectedSdwt = ref("");
const sites = ref<string[]>([]);
const sdwts = ref<string[]>([]);
const summary = ref<DashboardSummaryDto>({
  totalEqpCount: 0,
  onlineAgentCount: 0,
  todayErrorCount: 0,
  newAlarmCount: 0,
});
const agentList = ref<AgentStatusDto[]>([]);
const showChart = ref(false);
const selectedAgentId = ref<string | null>(null);
const chartData = ref<any[]>([]);

const refreshCount = ref(30);
let refreshTimer: number | null = null;

const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshCount.value = 30;
  refreshTimer = setInterval(() => {
    refreshCount.value--;
    if (refreshCount.value <= 0) {
      loadData(false);
      refreshCount.value = 30;
    }
  }, 1000);
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const manualRefresh = () => {
  loadData(true);
  refreshCount.value = 30;
};

onUnmounted(() => {
  stopAutoRefresh();
});

const chartConfig = {
  xField: "timestamp",
  xTimeUnit: "minute",
  xAxisDateFormat: "yy-MM-dd HH:mm",
  tooltipDateFormat: "yy-MM-dd HH:mm",
  series: [
    {
      name: "CPU",
      valueField: "cpuUsage",
      color: "#3b82f6",
      tooltipText: "CPU: {valueY.formatNumber('#.00')}%",
    },
    {
      name: "MEM",
      valueField: "memoryUsage",
      color: "#10b981",
      tooltipText: "MEM: {valueY.formatNumber('#.00')}%",
    },
  ],
};

const first = ref(0);
const rowsPerPage = ref(15);

const filteredAgents = computed(() => {
  switch (activeFilter.value) {
    case "Online":
      return agentList.value.filter((a) => a.isOnline);
    case "Offline":
      return agentList.value.filter((a) => !a.isOnline);
    case "Alarm":
      return agentList.value.filter((a) => a.todayAlarmCount > 0);
    case "TimeSync":
      return agentList.value.filter((a) => Math.abs(a.clockDrift || 0) > 1800);
    default:
      return agentList.value;
  }
});

const timeSyncErrorCount = computed(() => {
  return agentList.value.filter((a) => Math.abs(a.clockDrift || 0) > 1800)
    .length;
});

const totalRecords = computed(() => filteredAgents.value.length);

const compareVersions = (v1: string, v2: string) => {
  const p1 = v1
    .replace(/[^0-9.]/g, "")
    .split(".")
    .map(Number);
  const p2 = v2
    .replace(/[^0-9.]/g, "")
    .split(".")
    .map(Number);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
};

const highestVersion = computed(() => {
  if (!agentList.value || agentList.value.length === 0) return "";
  return agentList.value.reduce((max, curr) => {
    if (!curr.appVersion) return max;
    if (!max) return curr.appVersion;
    return compareVersions(curr.appVersion, max) > 0 ? curr.appVersion : max;
  }, "");
});

const getAgentVerStyle = (ver: string | null) => {
  if (!ver)
    return "bg-transparent border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-600";
  if (ver === highestVersion.value) {
    return "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-300 shadow-sm";
  }
  return "bg-transparent border-slate-300 text-slate-500 dark:border-zinc-600 dark:text-zinc-400";
};

const prevPage = () => {
  if (first.value > 0) first.value -= rowsPerPage.value;
};
const nextPage = () => {
  if (first.value + rowsPerPage.value < totalRecords.value)
    first.value += rowsPerPage.value;
};
const lastPage = () => {
  first.value =
    Math.floor(Math.max(totalRecords.value - 1, 0) / rowsPerPage.value) *
    rowsPerPage.value;
};

const setActiveFilter = (
  filter: "All" | "Online" | "Offline" | "Alarm" | "TimeSync"
) => {
  activeFilter.value = filter;
  first.value = 0;
};

onMounted(async () => {
  try {
    sites.value = await dashboardApi.getSites();
    const savedSite = localStorage.getItem("dashboard_site");
    const savedSdwt = localStorage.getItem("dashboard_sdwt");
    if (savedSite && sites.value.includes(savedSite)) {
      selectedSite.value = savedSite;
      sdwts.value = await dashboardApi.getSdwts(savedSite);
      if (savedSdwt && sdwts.value.includes(savedSdwt)) {
        selectedSdwt.value = savedSdwt;
        await loadData(true);
      }
    }
  } catch (e) {
    console.error(e);
  }
});

const loadData = async (showLoading = true) => {
  if (!selectedSite.value || !selectedSdwt.value) return;

  if (showLoading) {
    isSummaryLoading.value = true;
    isTableLoading.value = true;
  }
  hasSearched.value = true;

  try {
    const [summaryData, agentData] = await Promise.all([
      dashboardApi.getSummary(selectedSite.value, selectedSdwt.value),
      dashboardApi.getAgentStatus(selectedSite.value, selectedSdwt.value),
    ]);

    summary.value = summaryData;
    agentList.value = agentData;
    startAutoRefresh();
  } catch (e) {
    console.error(e);
  } finally {
    isSummaryLoading.value = false;
    isTableLoading.value = false;
  }
};

const onSiteChanged = async () => {
  if (selectedSite.value) {
    localStorage.setItem("dashboard_site", selectedSite.value);
    sdwts.value = await dashboardApi.getSdwts(selectedSite.value);
  } else {
    localStorage.removeItem("dashboard_site");
    sdwts.value = [];
  }
  selectedSdwt.value = "";
  localStorage.removeItem("dashboard_sdwt");
  hasSearched.value = false;
  stopAutoRefresh();
};

const onSdwtChange = async () => {
  if (selectedSdwt.value) {
    localStorage.setItem("dashboard_sdwt", selectedSdwt.value);
    await loadData(true);
  } else {
    localStorage.removeItem("dashboard_sdwt");
    stopAutoRefresh();
  }
};

const getOsStyle = (os: string | null) => {
  const lowerOs = (os || "").toLowerCase();
  if (lowerOs.includes("11"))
    return {
      badge:
        "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30",
      text: "text-indigo-700 dark:text-indigo-200 font-medium",
    };
  if (lowerOs.includes("10"))
    return {
      badge:
        "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30",
      text: "text-slate-700 dark:text-slate-200",
    };
  if (lowerOs.includes("7"))
    return {
      badge:
        "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
      text: "text-blue-700 dark:text-blue-200",
    };
  if (lowerOs.includes("server"))
    return {
      badge:
        "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600",
      text: "text-slate-600 dark:text-slate-400",
    };
  return {
    badge:
      "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    text: "text-gray-500 dark:text-gray-500",
  };
};

const getStatusLabel = (data: AgentStatusDto) => {
  if (!data.isOnline) return "Unknown";
  if (data.todayAlarmCount > 0) return "Alert";
  return "Run";
};
const getStatusIcon = (data: AgentStatusDto) => {
  if (!data.isOnline) return "pi pi-question-circle";
  if (data.todayAlarmCount > 0) return "pi pi-exclamation-triangle";
  return "pi pi-shield";
};
const getStatusBadgeClass = (data: AgentStatusDto) => {
  if (!data.isOnline)
    return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
  if (data.todayAlarmCount > 0)
    return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  return "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
};
const formatOperatingSystem = (os: string | null, sys: string | null) =>
  `${(os || "")
    .replace("Microsoft Windows", "Win")
    .replace("Professional", "Pro")
    .replace("Enterprise", "Ent")} ${(sys || "").replace(
    "-bit",
    "bit"
  )}`.trim();
const formatTimeDifference = (s: number | null | undefined) => {
  if (s == null) return "N/A";
  if (Math.abs(s) < 0.1) return "✔";
  const sign = s > 0 ? "-" : "+";
  const abs = Math.abs(s);
  const h = Math.floor(abs / 3600),
    m = Math.floor((abs % 3600) / 60),
    sec = Math.floor(abs % 60);
  return `${sign} ${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${
    sec > 0 || (h == 0 && m == 0) ? sec + "s" : ""
  }`.trim();
};
const getClockDriftColor = (s: number | null | undefined) => {
  if (s == null) return "text-slate-600 dark:text-slate-300";
  const absDrift = Math.abs(s);
  if (absDrift > 1800) return "text-red-500 dark:text-red-400 font-bold";
  if (absDrift > 600) return "text-orange-500 dark:text-orange-400 font-bold";
  return "text-slate-600 dark:text-slate-300";
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
const formatDate = (d: string | null) => {
  if (!d) return "-";
  const date = new Date(d);
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};
</script>

<style scoped>
/* Select Styles */
:deep(.p-select),
:deep(.custom-dropdown) {
  @apply !bg-slate-100 dark:!bg-zinc-800/50 !border-0 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm shadow-none transition-colors;
}
:deep(.custom-dropdown:hover) {
  @apply !bg-slate-200 dark:!bg-zinc-800;
}
:deep(.p-select-label) {
  padding: 0.6rem 1rem;
}
:deep(.p-select-dropdown) {
  @apply text-slate-400 dark:text-zinc-500 w-10;
}
:deep(.p-datatable .p-datatable-thead > tr > th) {
  font-weight: 800;
  font-size: 0.7rem;
  color: #64748b;
  background-color: transparent;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}
:deep(.dark .p-datatable .p-datatable-thead > tr > th) {
  color: #71717a;
  border-bottom: 1px solid #27272a;
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
  padding: 1rem;
  font-size: 0.85rem;
  color: #334155;
}
:deep(.dark .p-datatable-tbody > tr > td) {
  color: #e2e8f0 !important;
}
.fade-in {
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

<style>
body .p-tooltip .p-tooltip-text {
  font-size: 11px !important;
  background-color: #64748b !important;
  white-space: nowrap !important;
  padding: 4px 8px !important;
}
body .p-tooltip .p-tooltip-arrow {
  border-top-color: #64748b !important;
  border-bottom-color: #64748b !important;
}
</style>
