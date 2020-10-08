import React from 'react';
import { NativeModules } from 'react-native';

const { StartupTrace } = NativeModules;

const stopStartupTrace = () => NativeModules.StartupPerformanceTrace.stop();

const useStopStartupTrace = () => {
  React.useEffect(() => {
    /**
     * Applying a timeout to make sure we wait for JS to be responsive
     */
    const traceTimeout = setTimeout(stopStartupTrace);

    return () => {
      clearTimeout(traceTimeout);
    };
  }, []);
};

export { useStopStartupTrace };
