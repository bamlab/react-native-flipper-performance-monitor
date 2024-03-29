import React, { useMemo, useEffect, ComponentProps } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

export const Chart = ({
  data,
  title,
  height,
  interval,
  timeLimit,
  color,
}: {
  data: { x: number; y: number }[];
  title: string;
  height: number;
  interval: number;
  timeLimit?: number | null;
  color?: string;
}) => {
  const series = useMemo(
    () => [
      {
        name: title,
        data: data,
      },
    ],
    [data, interval, title]
  );

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
            speed: interval,
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
      xaxis: timeLimit
        ? { type: "numeric", min: 0, max: timeLimit }
        : { type: "numeric", min: 0, max: undefined },
      yaxis: {
        min: 0,
        max: 60,
      },
      colors: [color],
    }),
    [title, timeLimit]
  );

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={height}
    />
  );
};
