import React, { ReactNode, useEffect, useState } from "react";
import { Chart } from "./components/Chart";
import { Report } from "./Report";
import { StartButton } from "./components/StartButton";
import { ScrollContainer } from "./components/ScrollContainer";
import { Title } from "./components/Title";
import { Measure } from "./types/Measure";
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useTheme,
} from "@material-ui/core";

const sanitizeData = (fps: number) => {
  if (fps > 60) return 60;
  if (fps < 0) return 0;
  return Math.ceil(fps);
};

const ControlsContainer = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      margin: 10,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

const TimeLimitControl = ({
  timeLimitEnabled,
  toggleTimeLimit,
  setTimeLimit,
  timeLimit,
}: {
  timeLimitEnabled: boolean;
  timeLimit: number | null;
  setTimeLimit: (limit: number | null) => void;
  toggleTimeLimit: (checked: boolean) => void;
}) => (
  <div
    style={{
      marginLeft: 10,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          checked={timeLimitEnabled}
          onChange={(event: { target: { checked: boolean } }) => {
            toggleTimeLimit(event.target.checked);
          }}
        />
      }
      label="Enable time limit of "
    />
    <TextField
      type="number"
      onChange={({ target: { value } }) =>
        setTimeLimit(Math.floor(parseInt(value, 10)))
      }
      defaultValue={timeLimit}
    />
    <Typography>ms</Typography>
  </div>
);

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

  const DEFAULT_TIME_LIMIT = 10000;
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [timeLimit, setTimeLimit] = useState<number | null>(DEFAULT_TIME_LIMIT);
  useEffect(() => {
    if (timeLimit && measures.length > timeLimit / MEASURE_INTERVAL) {
      stopMeasuring();
    }
  }, [timeLimit, measures]);

  const { palette } = useTheme();

  return (
    <ScrollContainer>
      <Title />
      <Report measures={measures} isMeasuring={isMeasuring} />
      <ControlsContainer>
        <StartButton
          isMeasuring={isMeasuring}
          start={startMeasuring}
          stop={stopMeasuring}
        />
        <TimeLimitControl
          timeLimitEnabled={timeLimitEnabled}
          toggleTimeLimit={setTimeLimitEnabled}
          setTimeLimit={setTimeLimit}
          timeLimit={timeLimit}
        />
      </ControlsContainer>
      <Chart
        data={getFPSGraphData("JS")}
        height={350}
        title="JS FPS"
        interval={MEASURE_INTERVAL}
        timeLimit={timeLimitEnabled ? timeLimit : null}
        color={palette.primary.light}
      />
      <Chart
        data={getFPSGraphData("UI")}
        height={350}
        title="UI FPS"
        interval={MEASURE_INTERVAL}
        timeLimit={timeLimitEnabled ? timeLimit : null}
        color={palette.secondary.main}
      />
    </ScrollContainer>
  );
};
