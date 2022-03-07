import { Measure, ThreadMeasure, ThreadType } from "../types/Measure";

const sanitizeData = ({ frameCount, time }: ThreadMeasure) => {
  if (frameCount > (60 * time) / 1000) {
    return {
      frameCount: (60 * time) / 1000,
      time,
    };
  }

  if (frameCount < 0) {
    return {
      frameCount: 0,
      time,
    };
  }

  return {
    frameCount,
    time,
  };
};

const INTERVAL = 500;

const splitMeasure = (measure: ThreadMeasure): ThreadMeasure[] => {
  if (measure.time <= 500) {
    return [measure];
  }

  return [
    { frameCount: 0, time: INTERVAL },
    ...splitMeasure({
      frameCount: measure.frameCount,
      time: measure.time - INTERVAL,
    }),
  ];
};

export const getThreadMeasures = (
  measures: Measure[],
  thread: ThreadType
): ThreadMeasure[] => {
  return measures
    .filter((measure) => measure.thread === thread)
    .map((measure) => ({ frameCount: measure.frameCount, time: measure.time }))
    .reduce<ThreadMeasure[]>((aggr, measure) => {
      return [...aggr, ...splitMeasure(measure)];
    }, [])
    .map(sanitizeData);
};
