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

  if (config.xAxisDateFormat) {
    const dateFormats = xAxis.get("dateFormats");
    if (dateFormats) {
      dateFormats["minute"] = config.xAxisDateFormat;
      dateFormats["hour"] = config.xAxisDateFormat;
      dateFormats["day"] = config.xAxisDateFormat;
    }
  }
  if (config.tooltipDateFormat) {
    xAxis.set("tooltipDateFormat", config.tooltipDateFormat);
  }

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

      if (!targetYAxis) return;

      // [수정] 시리즈 색상 객체 생성
      const seriesColor = am5.color(s.color);

      // [수정] 툴팁 생성 및 색상 강제 적용
      const tooltip = am5.Tooltip.new(root, {
        labelText: s.tooltipText || "{valueY}",
        autoTextColor: false, // 텍스트 색상 자동 조정 끄기 (흰색 고정 위해)
      });

      // 툴팁 배경색을 시리즈 색상과 100% 일치시킴
      tooltip.get("background")?.setAll({
        fill: seriesColor,
        stroke: seriesColor,
        fillOpacity: 0.9,
      });

      // 툴팁 글자색은 흰색으로 고정
      tooltip.label.setAll({
        fill: am5.color(0xffffff),
      });

      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: s.name,
          xAxis: xAxis,
          yAxis: targetYAxis,
          valueYField: s.valueField,
          valueXField: config.xField,
          stroke: seriesColor,
          fill: seriesColor,
          tooltip: tooltip,
        })
      );

      // [수정] 선 굵기를 2 (기본값)으로 설정하여 얇게 표현
      series.strokes.template.setAll({
        strokeWidth: s.strokeWidth || 2,
      });

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
