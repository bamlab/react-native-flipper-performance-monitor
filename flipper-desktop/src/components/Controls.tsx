import React from "react";
import { Button } from "@material-ui/core";

export const Controls = ({
  isMeasuring,
  start,
  stop,
}: {
  isMeasuring: boolean;
  start: () => void;
  stop: () => void;
}) => (
  <>
    <Button
      variant="contained"
      color="primary"
      disabled={isMeasuring}
      onClick={start}
      style={{ marginBottom: 10 }}
    >
      Start
    </Button>
    <Button
      variant="contained"
      color="primary"
      disabled={!isMeasuring}
      onClick={stop}
    >
      Stop
    </Button>
  </>
);
