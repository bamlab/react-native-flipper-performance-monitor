import React, { useMemo, useEffect, ComponentProps } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

const formatMeasuresToXY = (
  data: number[],
  interval: number
): { x: number; y: number }[] => {
  return data.map((y, index) => ({
    x: index * interval,
    y,
  }));
};

export const Chart = ({
  data,
  title,
  height,
  interval,
  timeLimit,
}: {
  data: number[];
  title: string;
  height: number;
  interval: number;
  timeLimit?: number | null;
}) => {
  const series = useMemo(
    () => [
      {
        data: formatMeasuresToXY(data, interval),
      },
    ],
    [data, interval]
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
      // @ts-ignore "time" is definitely an option
      xaxis: timeLimit
        ? { type: "numeric", min: 0, max: timeLimit }
        : {
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
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={height}
    />
  );
};
