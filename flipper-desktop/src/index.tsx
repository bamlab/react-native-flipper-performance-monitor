import React, { useState } from "react";
import {
  createState,
  PluginClient,
  styled,
  usePlugin,
  useValue,
} from "flipper-plugin";
import { Button, Typography } from "@material-ui/core";
import { Chart } from "./Chart";
import { Report } from "./Report";
import { Measure } from "./types/Measure";

const ScrollContainer = styled("div")<{ scrollable: boolean }>(
  ({ scrollable }) => ({
    overflow: scrollable ? "auto" : "hidden",
    flex: "auto",
    flexDirection: "column",
    display: "flex",
  })
);

const Title = () => (
  <Typography
    variant="h3"
    component="h3"
    style={{ textAlign: "center", width: "100%", paddingBottom: 20 }}
  >
    Performance
  </Typography>
);

const Controls = ({
  isMeasuring,
  start,
  stop,
}: {
  isMeasuring: boolean;
  start: () => void;
  stop: () => void;
}) => (
  <>
    <Button
      variant="contained"
      color="primary"
      disabled={isMeasuring}
      onClick={start}
      style={{ marginBottom: 10 }}
    >
      Start
    </Button>
    <Button
      variant="contained"
      color="primary"
      disabled={!isMeasuring}
      onClick={stop}
    >
      Stop
    </Button>
  </>
);

const sanitizeData = (fps: number) => {
  if (fps > 60) return 60;
  if (fps < 0) return 0;
  return Math.ceil(fps);
};

// This is the same value as defined here: https://github.com/bamlab/react-native-performance/blob/master/flipper-android/src/main/java/tech/bam/rnperformance/FPSMonitor.java#L42
const MEASURE_INTERVAL = 500;
const formatFpsToXY = (fps: number[]): { x: number; y: number }[] => {
  return fps.map((y, index) => ({
    x: index * MEASURE_INTERVAL,
    y,
  }));
};

const PerfMonitorView = ({
  measures,
  startMeasuring,
  stopMeasuring,
}: {
  measures: Measure[];
  startMeasuring: () => void;
  stopMeasuring: () => void;
}) => {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const getFPSGraphData = (key: "JS" | "UI") => {
    return formatFpsToXY(
      measures
        .map((measure) => (measure[key] / measure.expected) * 60)
        .map(sanitizeData)
    );
  };

  return (
    <ScrollContainer scrollable>
      <Title />
      {!isMeasuring && measures.length > 0 ? (
        <Report measures={measures} />
      ) : null}
      <Controls
        isMeasuring={isMeasuring}
        start={() => {
          setIsMeasuring(true);
          startMeasuring();
        }}
        stop={() => {
          stopMeasuring();
          setIsMeasuring(false);
        }}
      />
      <Chart data={getFPSGraphData("JS")} height={350} title="JS FPS" />
      <Chart data={getFPSGraphData("UI")} height={350} title="UI FPS" />
    </ScrollContainer>
  );
};

type Events = {
  addRecord: Measure;
};

type Methods = {
  startMeasuring: () => Promise<void>;
  stopMeasuring: () => Promise<void>;
};

export function plugin(client: PluginClient<Events, Methods>) {
  const measures = createState<Measure[]>([], {
    persist: "measures",
  });

  client.onMessage("addRecord", (measure) => {
    measures.update((draft) => {
      draft.push(measure);
    });
  });

  const startMeasuring = () => {
    measures.update(() => []);
    client.send("startMeasuring", undefined);
  };

  const stopMeasuring = async () => {
    client.send("stopMeasuring", undefined);
  };

  return {
    measures: measures,
    startMeasuring,
    stopMeasuring,
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  // First measure is usually 0 regardless of performance
  const measures = useValue(instance.measures).slice(1);

  return (
    <PerfMonitorView
      measures={measures}
      startMeasuring={instance.startMeasuring}
      stopMeasuring={instance.stopMeasuring}
    />
  );
}
