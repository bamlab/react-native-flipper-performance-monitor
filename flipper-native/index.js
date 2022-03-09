import { NativeModules } from "react-native";

function fibonacci(n) {
  return n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
}

export const killJSThread = (intensity) => fibonacci(intensity);

export const killUIThread = (intensity) =>
  NativeModules.FlipperPerformancePlugin.killUIThread(intensity);
