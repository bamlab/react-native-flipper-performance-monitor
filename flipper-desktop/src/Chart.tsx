import React, { useMemo, useEffect, ComponentProps } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const sanitizeData = (fps: number) => {
  if (fps > 60) return 60;
  if (fps < 0) return 0;
  return Math.ceil(fps);
};

// This is the same value as defined here: https://github.com/bamlab/react-native-performance/blob/master/flipper-android/src/main/java/tech/bam/rnperformance/FPSMonitor.java#L42
const INTERVAL = 500;
const formatFpsToXY = (fps: number[]): { x: number; y: number }[] => {
  return fps.map((y, index) => ({
    x: index * INTERVAL,
    y,
  }));
};

export const Chart = ({
  fps,
  title,
  height,
  threshold,
}: {
  fps: number[];
  title: string;
  height: number;
  threshold: number;
}) => {
  useEffect(() => {
    ApexCharts.exec(title, "updateSeries", [
      {
        data: formatFpsToXY(fps.map(sanitizeData)),
      },
    ]);
  }, [fps]);

  const options = useMemo<ComponentProps<typeof ReactApexChart>["options"]>(
    () => ({
      chart: {
        id: title,
        height: 350,
        type: "line",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 1000,
          },
        },
        zoom: {
          enabled: false,
        },
      },
      title: {
        text: title,
        align: "left",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        // @ts-ignore "time" is definitely an option
        type: "time",
      },
      yaxis: {
        min: 0,
        max: 60,
      },
    }),
    [title]
  );

  return (
    <ReactApexChart options={options} series={[]} type="line" height={height} />
  );
};
