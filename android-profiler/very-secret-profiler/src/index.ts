import _ from "lodash";
import { detectCurrentAppBundleId } from "./commands/detectCurrentAppBundleId";
import { getPidId } from "./commands/getPidId";
import { pollCpuPerCoreUsage } from "./commands/pollCpuPerCoreUsage";
import { pollFpsUsage } from "./commands/pollFpsUsage";
import { pollRamUsage } from "./commands/pollRamUsage";
import {
  getAverageCpuUsage,
  getAverageCpuUsagePerProcess,
  getHighCpuUsageStats,
} from "./reporting/reporting";

export { type Measure } from "./Measure";

export {
  detectCurrentAppBundleId,
  getPidId,
  pollCpuPerCoreUsage,
  pollFpsUsage,
  pollRamUsage,
  getAverageCpuUsage,
  getAverageCpuUsagePerProcess,
  getHighCpuUsageStats,
};
