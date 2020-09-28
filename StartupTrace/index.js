
import { NativeModules } from 'react-native';

const { StartupPerformanceTrace } = NativeModules;

export default {
  // The timeout makes sure JS is responsive when stopping the trace
  stop: () => setTimeout(NativeModules.StartupPerformanceTrace.stop)
};
