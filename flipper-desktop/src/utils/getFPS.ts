import { ThreadMeasure } from "../types/Measure";
import { round } from "./round";

export const getFPS = (measure: ThreadMeasure) =>
  round((measure.frameCount / measure.time) * 1000, 1);
