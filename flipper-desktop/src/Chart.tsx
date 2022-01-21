import React, { useMemo, useEffect, ComponentProps } from "react";
import ReactApexChart from "react-apexcharts";
import ApexCharts from "apexcharts";

export const Chart = ({
  data,
  title,
  height,
  threshold,
}: {
  data: { x: number; y: number }[];
  title: string;
  height: number;
  threshold: number;
}) => {
  useEffect(() => {
    ApexCharts.exec(title, "updateSeries", [
      {
        data,
      },
    ]);
  }, [data]);

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
