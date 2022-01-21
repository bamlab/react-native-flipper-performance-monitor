import React from "react";
import { Chart } from "./components/Chart";
import { Report } from "./Report";
import { Controls } from "./components/Controls";
import { ScrollContainer } from "./components/ScrollContainer";
import { Title } from "./components/Title";
import { Measure } from "./types/Measure";

const sanitizeData = (fps: number) => {
  if (fps > 60) return 60;
  if (fps < 0) return 0;
  return Math.ceil(fps);
};

// This is the same value as defined here: https://github.com/bamlab/react-native-performance/blob/master/flipper-android/src/main/java/tech/bam/rnperformance/FPSMonitor.java#L42
const MEASURE_INTERVAL = 500;

export const PerfMonitorView = ({
  measures,
  startMeasuring,
  stopMeasuring,
  isMeasuring,
}: {
  measures: Measure[];
  startMeasuring: () => void;
  stopMeasuring: () => void;
  isMeasuring: boolean;
}) => {
  const getFPSGraphData = (key: "JS" | "UI") =>
    measures
      .map((measure) => (measure[key] / measure.expected) * 60)
      .map(sanitizeData);

  return (
    <ScrollContainer scrollable>
      <Title />
      {!isMeasuring && measures.length > 0 ? (
        <Report measures={measures} />
      ) : null}
      <Controls
        isMeasuring={isMeasuring}
        start={startMeasuring}
        stop={stopMeasuring}
      />
      <Chart
        data={getFPSGraphData("JS")}
        height={350}
        title="JS FPS"
        interval={MEASURE_INTERVAL}
      />
      <Chart
        data={getFPSGraphData("UI")}
        height={350}
        title="UI FPS"
        interval={MEASURE_INTERVAL}
      />
    </ScrollContainer>
  );
};
