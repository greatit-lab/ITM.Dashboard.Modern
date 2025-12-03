// frontend/src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WaferFlatDataView from "../views/WaferFlatDataView.vue";
import PerformanceTrendView from "../views/PerformanceTrendView.vue";
import EquipmentExplorerView from "../views/EquipmentExplorerView.vue";
import ErrorAnalyticsView from "../views/ErrorAnalyticsView.vue";
import LampLifeView from "../views/LampLifeView.vue";
import PreAlignAnalyticsView from "../views/PreAlignAnalyticsView.vue";
import ProcessMemoryView from "../views/ProcessMemoryView.vue";
// [추가] 새로운 분석 페이지 컴포넌트 임포트
import SpectrumAnalysisView from "../views/SpectrumAnalysisView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/waferflatdata", name: "wafer", component: WaferFlatDataView },
    {
      path: "/performance-trend",
      name: "performance",
      component: PerformanceTrendView,
    },
    {
      path: "/equipment-explorer",
      name: "equipment",
      component: EquipmentExplorerView,
    },
    { path: "/error-analytics", name: "error", component: ErrorAnalyticsView },
    { path: "/lamp-life", name: "lamp", component: LampLifeView },
    {
      path: "/prealign-analytics",
      name: "prealign",
      component: PreAlignAnalyticsView,
    },
    { path: "/process-memory", name: "process", component: ProcessMemoryView },
    // [추가] Spectrum Analysis 라우트 등록
    {
      path: "/spectrum-analytics",
      name: "spectrum",
      component: SpectrumAnalysisView,
    },
  ],
});

export default router;
