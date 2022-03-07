import { ThreadMeasure } from "../types/Measure";

export const getTotalTimeAndFrames = (
  measures: ThreadMeasure[]
): ThreadMeasure => {
  if (measures.length === 0) {
    return { frameCount: 0, time: 0 };
  }

  return measures.reduce((current, measure) => {
    return {
      time: current.time + measure.time,
      frameCount: current.frameCount + measure.frameCount,
    };
  });
};
