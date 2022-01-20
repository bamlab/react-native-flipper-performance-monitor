import React, { useState } from "react";
import {
  createState,
  PluginClient,
  styled,
  usePlugin,
  useValue,
} from "flipper-plugin";
import { Button, Typography } from "@material-ui/core";
import { Table } from "./Table";
import { Chart } from "./Chart";
import { CircularProgressWithLabel } from "./CircularProgressWithLabel";
import { round } from "./utils/round";

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

interface Measure {
  UI: number;
  JS: number;
  expected: number;
}

const Report = ({ measures }: { measures: Measure[] }) => {
  const getFrameCount = () => {
    return measures.reduce(
      ({ UI, JS, expected }, measure) => ({
        UI: UI + measure.UI,
        JS: JS + measure.JS,
        expected: expected + measure.expected,
      }),
      { UI: 0, JS: 0, expected: 0 }
    );
  };

  const getAverageFPS = () => {
    const { UI, JS, expected } = getFrameCount();

    return {
      UI: (UI * 60) / expected,
      JS: (JS * 60) / expected,
    };
  };

  const getJSDeadlockTime = () => {
    const { locked, total } = measures.reduce(
      ({ locked, total }, { JS, expected }) => ({
        locked: locked + (JS < 1 ? expected : 0),
        total: total + expected,
      }),
      { locked: 0, total: 0 }
    );

    return {
      time: (locked * 16.9) / 1000,
      percentage: locked / total,
    };
  };

  const getScore = () => {
    const averageFPS = getAverageFPS();

    const fpsScore = ((averageFPS.UI + averageFPS.JS) * 100) / 120;
    const jsLockMalus = getJSDeadlockTime().percentage;

    return round(Math.max(0, fpsScore * (1 - jsLockMalus)), 0);
  };

  const getReportRows = () => {
    const averageFPS = getAverageFPS();
    const jsLock = getJSDeadlockTime();

    return [
      { title: "Average JS FPS", value: round(averageFPS.JS, 1) },
      { title: "Average UI FPS", value: round(averageFPS.UI, 1) },
      {
        title: "JS  threadlock",
        value: `${round(jsLock.time, 3)}s (${round(
          jsLock.percentage * 100,
          2
        )}%)`,
      },
    ];
  };

  return (
    <>
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          display: "flex",
          marginBottom: 20,
        }}
      >
        <CircularProgressWithLabel size={80} value={getScore()} />
      </div>
      <Table rows={getReportRows()} />
    </>
  );
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
    return measures.map((measure) => (measure[key] / measure.expected) * 60);
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
      <Chart
        fps={getFPSGraphData("JS")}
        height={350}
        title="JS FPS"
        threshold={59}
      />
      <Chart
        fps={getFPSGraphData("UI")}
        height={350}
        title="UI FPS"
        threshold={10}
      />
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
