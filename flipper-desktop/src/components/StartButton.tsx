import React from "react";
import { Button } from "@material-ui/core";
import { PlayArrow, Stop } from "@material-ui/icons";

export const StartButton = ({
  isMeasuring,
  start,
  stop,
}: {
  isMeasuring: boolean;
  start: () => void;
  stop: () => void;
}) =>
  isMeasuring ? (
    <Button
      variant="contained"
      color="secondary"
      onClick={stop}
      startIcon={<Stop />}
    >
      Stop Measuring
    </Button>
  ) : (
    <Button
      variant="contained"
      color="primary"
      onClick={start}
      startIcon={<PlayArrow />}
    >
      Start Measuring
    </Button>
  );
