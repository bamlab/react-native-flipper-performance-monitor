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
const ERROR_MARGIN = 50;

const splitMeasure = (measure: ThreadMeasure): ThreadMeasure[] => {
  /**
   * Here we handle the thread reporting the measures being dead
   * In that case we could be a while with no measures actually reported
   *
   * On Android UI thread reports both UI and JS
   * On iOS, UI reports UI and JS reports JS
   *
   * It could happen though that the measure is a bit longer than 500ms, I experienced measures of 502ms
   * which doesn't necessarily mean that the JS thread is dead
   * so we introduce an error margin
   */
  if (measure.time <= INTERVAL + ERROR_MARGIN) {
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
