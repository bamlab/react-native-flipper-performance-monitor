import React, { useState } from "react";
import { createState, PluginClient, usePlugin, useValue } from "flipper-plugin";
import { Measure } from "./types/Measure";
import { PerfMonitorView } from "./PerfMonitorView";

type Events = {
  addRecord: Measure;
};

type Methods = {
  startMeasuring: () => Promise<void>;
  stopMeasuring: () => Promise<void>;
};

export function plugin(client: PluginClient<Events, Methods>) {
  const measures = createState<Measure[]>([], {
    persist: "measures",
  });

  client.onMessage("addRecord", (measure) => {
    measures.update((draft) => {
      draft.push(measure);
    });
  });

  const startMeasuring = () => {
    measures.update(() => []);
    client.send("startMeasuring", undefined);
  };

  const stopMeasuring = async () => {
    client.send("stopMeasuring", undefined);
  };

  return {
    measures: measures,
    startMeasuring,
    stopMeasuring,
  };
}

export function Component() {
  const instance = usePlugin(plugin);
  // First measure is usually 0 regardless of performance
  const measures = useValue(instance.measures).slice(1);

  const [isMeasuring, setIsMeasuring] = useState(false);
  const start = () => {
    setIsMeasuring(true);
    instance.startMeasuring();
  };

  const stop = () => {
    instance.stopMeasuring();
    setIsMeasuring(false);
  };

  return (
    <PerfMonitorView
      measures={measures}
      isMeasuring={isMeasuring}
      startMeasuring={start}
      stopMeasuring={stop}
    />
  );
}
