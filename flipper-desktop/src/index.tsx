import React, { useState } from "react";
import { FlipperPlugin, styled, colors, FlexRow, produce } from "flipper";

import { Button, Typography } from "@material-ui/core";
import { Table } from "./Table";
import { Chart } from "./Chart";
import { CircularProgressWithLabel } from "./CircularProgressWithLabel";

type State = {};

type Data = {
  UI: number;
  JS: number;
  expected: number;
};

type PersistedState = {
  measures: Array<Data>;
};

const round = (n: number, decimals: number) => {
  const power = Math.pow(10, decimals);
  return Math.floor(n * power) / power;
};

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

export default class PerfMonitor extends FlipperPlugin<
  State,
  any,
  PersistedState
> {
  static Container = styled(FlexRow)({
    backgroundColor: colors.macOSTitleBarBackgroundBlur,
    flexWrap: "wrap",
    alignItems: "flex-start",
    alignContent: "flex-start",
    flexGrow: 1,
    overflow: "scroll",
  });

  static defaultPersistedState: PersistedState = {
    measures: [],
  };

  static persistedStateReducer<PersistedState>(
    persistedState: PersistedState,
    method: string,
    payload: any
  ) {
    return produce(persistedState, ({ measures }: { measures: Measure[] }) => {
      measures.push(payload);
    });
  }

  startMeasuring = () => {
    this.props.setPersistedState({ measures: [] });
    this.client.call("startMeasuring");
  };

  stopMeasuring = async () => {
    this.client.call("stopMeasuring");
  };

  getMeasures = () => {
    const {
      persistedState: { measures },
    } = this.props;
    // First measure is usually 0 regardless of performance
    return measures.slice(1);
  };

  render() {
    return (
      <PerfMonitorView
        measures={this.getMeasures()}
        startMeasuring={this.startMeasuring}
        stopMeasuring={this.stopMeasuring}
      />
    );
  }
}
