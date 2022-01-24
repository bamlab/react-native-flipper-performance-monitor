import React from "react";
import { CircularProgressWithLabel } from "./components/CircularProgressWithLabel";
import { Table } from "./components/Table";
import { round } from "./utils/round";
import { Measure } from "./types/Measure";

const getColor = (score: number) => {
  if (score >= 90) return "#2ECC40";
  if (score >= 50) return "#FF851B";
  return "#FF4136";
};

export const Report = ({
  measures,
  isMeasuring,
}: {
  measures: Measure[];
  isMeasuring: boolean;
}) => {
  const displayPlaceholder = measures.length === 0 || isMeasuring;

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
      {
        title: "Average JS FPS",
        value: displayPlaceholder ? "-" : round(averageFPS.JS, 1),
      },
      {
        title: "Average UI FPS",
        value: displayPlaceholder ? "-" : round(averageFPS.UI, 1),
      },
      {
        title: "JS  threadlock",
        value: displayPlaceholder
          ? "-"
          : `${round(jsLock.time, 3)}s (${round(jsLock.percentage * 100, 2)}%)`,
      },
    ];
  };

  const score = displayPlaceholder ? 100 : getScore();
  const color = displayPlaceholder ? "#eeeeee50" : getColor(score);

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
        <CircularProgressWithLabel size={80} color={color} value={score} />
      </div>
      <Table rows={getReportRows()} />
    </>
  );
};
