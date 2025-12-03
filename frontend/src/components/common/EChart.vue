<!-- frontend/src/components/common/EChart.vue -->
<template>
  <div ref="chartRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps<{
  option: any;
  theme?: string | object;
}>();

// ▼▼▼ [추가] 차트 생성 완료 이벤트를 정의합니다. ▼▼▼
const emit = defineEmits(["chartCreated"]);

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

const initChart = () => {
  if (chartRef.value) {
    if (chartInstance) {
      chartInstance.dispose();
    }

    const isDark = document.documentElement.classList.contains("dark");
    const theme = props.theme || (isDark ? "dark" : undefined);

    chartInstance = echarts.init(chartRef.value, theme);
    
    // ▼▼▼ [추가] 차트 인스턴스가 생성되면 부모에게 전달합니다. ▼▼▼
    emit("chartCreated", chartInstance);

    if (props.option) {
      chartInstance.setOption(props.option);
    }
  }
};

// ... (나머지 코드는 기존과 동일하게 유지) ...
// setupResizeObserver, watch, themeObserver, onMounted, onUnmounted 등 기존 코드 유지
const setupResizeObserver = () => {
  if (!chartRef.value) return;
  resizeObserver = new ResizeObserver(() => {
    if (chartInstance) chartInstance.resize();
  });
  resizeObserver.observe(chartRef.value);
};

watch(
  () => props.option,
  (newOption) => {
    if (chartInstance && newOption) {
      chartInstance.setOption(newOption, { notMerge: false, lazyUpdate: true });
    }
  },
  { deep: true }
);

const themeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      initChart();
    }
  });
});

onMounted(() => {
  initChart();
  setupResizeObserver();
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
  themeObserver.disconnect();
  chartInstance?.dispose();
});
</script>
