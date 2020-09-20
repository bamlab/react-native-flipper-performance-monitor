import React, {useMemo, useEffect} from 'react';
import ReactApexChart from 'react-apexcharts';
import ApexCharts from 'apexcharts';

const sanitizeData = (fps: number) => {
  if (fps > 60) return 60;
  if (fps < 0) return 0;
  return Math.ceil(fps);
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
    ApexCharts.exec(title, 'updateSeries', [
      {
        data: fps.map(sanitizeData),
      },
    ]);
  }, [fps]);

  const options = useMemo(
    () => ({
      chart: {
        id: title,
        height: 350,
        type: 'line',
        animations: {
          enabled: true,
          easing: 'linear',
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
        align: 'left',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: ['Time'],
      },
      yaxis: {
        min: 0,
        max: 60,
      },
    }),
    [title],
  );

  return (
    <ReactApexChart options={options} series={[]} type="line" height={height} />
  );
};
