<template>
  <div ref="chartRef" class="w-full h-full" :style="{ height: height }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

const props = defineProps<{
  chartType: string;
  data: any[];
  config: any;
  height?: string;
  isDarkMode?: boolean;
}>();

const chartRef = ref<HTMLElement | null>(null);
let root: am5.Root | null = null;

const createChart = () => {
  if (!chartRef.value) return;
  if (root) root.dispose();

  root = am5.Root.new(chartRef.value);
  const myTheme = props.isDarkMode
    ? am5themes_Dark.new(root)
    : am5themes_Animated.new(root);
  root.setThemes([myTheme]);

  createLineChart(root, props.data, props.config, props.isDarkMode || false);
};

const createLineChart = (
  root: am5.Root,
  data: any[],
  config: any,
  isDark: boolean
) => {
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      layout: root.verticalLayout,
    })
  );

  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, { behavior: "zoomXY" })
  );
  cursor.lineY.set("visible", false);

  const textColor = isDark ? am5.color(0xffffff) : am5.color(0x000000);

  // 1. X축 설정
  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: config.xTimeUnit || "minute", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 80 }),
      tooltip: am5.Tooltip.new(root, {}),
    })
  );

  xAxis.get("renderer").labels.template.setAll({
    fill: textColor,
    rotation: -45,
    centerY: am5.p50,
    centerX: am5.p100,
  });

  // 2. Y축 설정
  const yAxes: am5xy.ValueAxis<am5xy.AxisRenderer>[] = [];

  if (config.yAxes && Array.isArray(config.yAxes)) {
    config.yAxes.forEach((yCfg: any) => {
      const renderer = am5xy.AxisRendererY.new(root, {
        opposite: yCfg.opposite || false,
      });
      renderer.labels.template.set("fill", textColor);
      const axis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer,
          min: yCfg.min,
          max: yCfg.max,
        })
      );
      yAxes.push(axis);
    });
  } else {
    const renderer = am5xy.AxisRendererY.new(root, {});
    renderer.labels.template.set("fill", textColor);
    yAxes.push(chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer })));
  }

  // 3. 시리즈 생성
  if (config.series) {
    config.series.forEach((s: any) => {
      const yAxisIndex = s.yAxisIndex || 0;
      const targetYAxis = yAxes[yAxisIndex] || yAxes[0];

      // [수정] TypeScript 오류 해결: Y축 존재 여부를 확실하게 체크하여 undefined 방지
      if (!targetYAxis) return;

      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: s.name,
          xAxis: xAxis,
          yAxis: targetYAxis,
          valueYField: s.valueField,
          valueXField: config.xField,
          stroke: am5.color(s.color),
          tooltip: am5.Tooltip.new(root, {
            labelText: s.tooltipText || "{valueY}",
          }),
        })
      );

      if (s.bulletRadius) {
        series.bullets.push(() =>
          am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: s.bulletRadius,
              fill: series.get("stroke"),
            }),
          })
        );
      }

      series.data.processor = am5.DataProcessor.new(root, {
        dateFields: [config.xField],
        dateFormat: "yyyy-MM-ddTHH:mm:ss",
      });

      series.data.setAll(data);
    });
  }

  const legend = chart.children.push(
    am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 })
  );
  legend.labels.template.set("fill", textColor);
  legend.data.setAll(chart.series.values);
};

onMounted(() => createChart());
onUnmounted(() => {
  if (root) root.dispose();
});
watch(
  [() => props.data, () => props.config],
  () => {
    if (root) nextTick(() => createChart());
  },
  { deep: true }
);
</script>
