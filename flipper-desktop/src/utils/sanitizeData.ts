import { ThreadMeasure } from "../types/Measure";

export const sanitizeData = ({ frameCount, time }: ThreadMeasure) => {
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
