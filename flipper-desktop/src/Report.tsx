import React from "react";
import { CircularProgressWithLabel } from "./components/CircularProgressWithLabel";
import { Table } from "./components/Table";
import { round } from "./utils/round";
import { ThreadMeasure } from "./types/Measure";
import { getTotalTimeAndFrames } from "./utils/getTotalTimeAndFrames";
import { getFPS } from "./utils/getFPS";

const getColor = (score: number) => {
  if (score >= 90) return "#2ECC40";
  if (score >= 50) return "#FF851B";
  return "#FF4136";
};

const getTimeThreadlocked = (jsMeasures: ThreadMeasure[]) => {
  return jsMeasures.reduce((totalTimeLocked, measure) => {
    if (measure.frameCount < 1) {
      return totalTimeLocked + measure.time;
    }

    return totalTimeLocked;
  }, 0);
};

export const Report = ({
  jsMeasures,
  uiMeasures,
  isMeasuring,
}: {
  jsMeasures: ThreadMeasure[];
  uiMeasures: ThreadMeasure[];
  isMeasuring: boolean;
}) => {
  const displayPlaceholder =
    jsMeasures.length === 0 || uiMeasures.length === 0 || isMeasuring;

  const jsTotalTimeAndTotalFrames = getTotalTimeAndFrames(jsMeasures);
  const averageJSFPS = getFPS(jsTotalTimeAndTotalFrames);
  const averageUIFPS = getFPS(getTotalTimeAndFrames(uiMeasures));

  const totalTimeThreadlocked = getTimeThreadlocked(jsMeasures);
  const timePercentageThreadlocked =
    totalTimeThreadlocked / jsTotalTimeAndTotalFrames.time;

  const getScore = () => {
    const fpsScore = ((averageUIFPS + averageJSFPS) * 100) / 120;

    return round(Math.max(0, fpsScore * (1 - timePercentageThreadlocked)), 0);
  };

  const getReportRows = () => {
    return [
      {
        title: "Average JS FPS",
        value: displayPlaceholder ? "-" : round(averageJSFPS, 1),
      },
      {
        title: "Average UI FPS",
        value: displayPlaceholder ? "-" : round(averageUIFPS, 1),
      },
      {
        title: "JS  threadlock",
        value: displayPlaceholder
          ? "-"
          : `${round(totalTimeThreadlocked / 1000, 3)}s (${round(
              timePercentageThreadlocked * 100,
              2
            )}%)`,
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
