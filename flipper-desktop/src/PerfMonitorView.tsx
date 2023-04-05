import React, { ReactNode, useEffect, useState } from "react";
import { Chart } from "./components/Chart";
import { Report } from "./Report";
import { StartButton } from "./components/StartButton";
import { ScrollContainer } from "./components/ScrollContainer";
import { Title } from "./components/Title";
import { Measure, ThreadMeasure } from "./types/Measure";
import {
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  useTheme,
} from "@material-ui/core";
import { getTotalTimeAndFrames } from "./utils/getTotalTimeAndFrames";
import { getFPS } from "./utils/getFPS";
import { getThreadMeasures } from "./utils/getThreadMeasures";

const getFPSGraphData = (measures: ThreadMeasure[]) =>
  measures.reduce<{ x: number; y: number }[]>((aggr, measure) => {
    return [
      ...aggr,
      {
        x: aggr.length > 0 ? aggr[aggr.length - 1].x + measure.time : 0,
        y: getFPS(measure),
      },
    ];
  }, []);

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
          inputProps={{
            "aria-label": "Time limit enabled",
          }}
          checked={timeLimitEnabled}
          onChange={(event: { target: { checked: boolean } }) => {
            toggleTimeLimit(event.target.checked);
          }}
        />
      }
      label="Enable time limit of "
    />
    <TextField
      inputProps={{
        "aria-label": "Time limit",
      }}
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
const MEASURE_INTERVAL = 1000;

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
  const JSThreadMeasures = getThreadMeasures(measures, "JS");
  const UIThreadMeasures = getThreadMeasures(measures, "UI");

  const DEFAULT_TIME_LIMIT = 10000;
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(true);
  const [timeLimit, setTimeLimit] = useState<number | null>(DEFAULT_TIME_LIMIT);

  const { time: JSMeasuresTotalTime } = getTotalTimeAndFrames(JSThreadMeasures);
  const { time: UIMeasuresTotalTime } = getTotalTimeAndFrames(UIThreadMeasures);

  useEffect(() => {
    if (
      timeLimitEnabled &&
      timeLimit &&
      (UIMeasuresTotalTime - UIThreadMeasures[0]?.time >= timeLimit ||
        JSMeasuresTotalTime - JSThreadMeasures[0]?.time >= timeLimit)
    ) {
      stopMeasuring();
    }
  }, [timeLimit, JSMeasuresTotalTime, UIMeasuresTotalTime, timeLimitEnabled]);

  const { palette } = useTheme();

  return (
    <ScrollContainer>
      <Title />
      <Report
        jsMeasures={JSThreadMeasures}
        uiMeasures={UIThreadMeasures}
        isMeasuring={isMeasuring}
      />
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
        data={getFPSGraphData(JSThreadMeasures)}
        height={350}
        title="JS FPS"
        interval={MEASURE_INTERVAL}
        timeLimit={timeLimitEnabled ? timeLimit : null}
        color={palette.primary.light}
      />
      <Chart
        data={getFPSGraphData(UIThreadMeasures)}
        height={350}
        title="UI FPS"
        interval={MEASURE_INTERVAL}
        timeLimit={timeLimitEnabled ? timeLimit : null}
        color={palette.secondary.main}
      />
    </ScrollContainer>
  );
};
