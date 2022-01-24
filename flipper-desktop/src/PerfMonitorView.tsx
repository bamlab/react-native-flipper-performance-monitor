import React, { useState } from "react";
import { Chart } from "./components/Chart";
import { Report } from "./Report";
import { Controls } from "./components/Controls";
import { ScrollContainer } from "./components/ScrollContainer";
import { Title } from "./components/Title";
import { Measure } from "./types/Measure";
import { Checkbox, FormControlLabel } from "@material-ui/core";

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

  const [timeLimit, setTimeLimit] = useState<number | null>(10000);
  const handleChange = (event: { target: { checked: boolean } }) => {
    setTimeLimit(event.target.checked ? 10000 : null);
  };

  return (
    <ScrollContainer scrollable>
      <Title />
      {!isMeasuring && measures.length > 0 ? (
        <Report measures={measures} />
      ) : null}

      <FormControlLabel
        control={<Checkbox checked={!!timeLimit} onChange={handleChange} />}
        label="Set time limit"
      />

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
        timeLimit={timeLimit}
      />
      <Chart
        data={getFPSGraphData("UI")}
        height={350}
        title="UI FPS"
        interval={MEASURE_INTERVAL}
        timeLimit={timeLimit}
      />
    </ScrollContainer>
  );
};
