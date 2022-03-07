export interface Measure extends ThreadMeasure {
  thread: "UI" | "JS";
}

export interface ThreadMeasure {
  frameCount: number;
  time: number;
}

export type ThreadType = "UI" | "JS";
