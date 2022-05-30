import { fireEvent } from "@testing-library/dom";
import { TestUtils } from "flipper-plugin";
import * as Plugin from "..";
import "@testing-library/jest-dom";

// See https://github.com/facebook/flipper/pull/3327
// @ts-ignore
global.electronRequire = require;
require("@testing-library/react");

// See https://github.com/apexcharts/react-apexcharts/issues/52
jest.mock("react-apexcharts", () => "apex-charts");
jest.mock("apexcharts", () => ({ exec: jest.fn() }));

const setupPlugin = () => {
  const { instance, renderer, sendEvent, onSend } =
    TestUtils.renderPlugin(Plugin);

  // First measure on Android is always 0 and is ignored by plugin
  sendEvent("addRecord", {
    frameCount: 0,
    thread: "JS",
    time: 500,
  });
  sendEvent("addRecord", {
    frameCount: 0,
    thread: "UI",
    time: 500,
  });

  return {
    addMeasure: ({
      JS,
      UI,
      time,
    }: {
      JS: number;
      UI: number;
      time?: number;
    }) => {
      sendEvent("addRecord", {
        frameCount: JS,
        thread: "JS",
        time: time || 500,
      });
      sendEvent("addRecord", {
        frameCount: UI,
        thread: "UI",
        time: time || 500,
      });
    },
    clickStart: () => fireEvent.click(renderer.getByText("Start Measuring")),
    clickStop: () => fireEvent.click(renderer.getByText("Stop Measuring")),
    expectToMatchSnapshot: () => {
      expect(
        (renderer.baseElement as HTMLBodyElement).textContent
      ).toMatchSnapshot();
      expect(renderer.baseElement).toMatchSnapshot();
    },
    setTimeLimit: (limit: number) => {
      const input = renderer.getByLabelText("Time limit");
      fireEvent.change(input, { target: { value: limit } });
    },
    clickTimeLimitCheckbox: () => {
      const checkbox = renderer.getByLabelText("Time limit enabled");
      fireEvent.click(checkbox);
    },

    renderer,
    instance,
    onSend,
  };
};

test("displays FPS data and scoring", async () => {
  const { addMeasure, expectToMatchSnapshot } = setupPlugin();

  addMeasure({ JS: 30, UI: 25 });
  addMeasure({ JS: 0, UI: 30 });

  expectToMatchSnapshot();
});

test("clicking start should reset measures and start measures", () => {
  const { addMeasure, clickStart, clickStop, instance, onSend } = setupPlugin();

  addMeasure({ JS: 30, UI: 25 });
  addMeasure({ JS: 0, UI: 30 });

  clickStart();
  expect(onSend).toHaveBeenCalledWith("startMeasuring", undefined);
  onSend.mockClear();

  expect(instance.measures.get()).toEqual([]);

  clickStop();
  expect(onSend).toHaveBeenCalledWith("stopMeasuring", undefined);
});

test("stops after set time limit", () => {
  const { addMeasure, setTimeLimit, onSend } = setupPlugin();

  setTimeLimit(1000);

  addMeasure({ JS: 30, UI: 30 });
  addMeasure({ JS: 30, UI: 30 });
  expect(onSend).not.toHaveBeenCalledWith("stopMeasuring", undefined);
  // 1000ms means 3 measures would be displayed: 0, 500 and 1000
  addMeasure({ JS: 30, UI: 30 });
  expect(onSend).toHaveBeenCalledWith("stopMeasuring", undefined);
});

test("continues after set time limit if time limit disabled", () => {
  const { addMeasure, clickTimeLimitCheckbox, setTimeLimit, onSend } =
    setupPlugin();

  setTimeLimit(1000);
  clickTimeLimitCheckbox();

  addMeasure({ JS: 30, UI: 30 });
  addMeasure({ JS: 30, UI: 30 });
  expect(onSend).not.toHaveBeenCalledWith("stopMeasuring", undefined);
  // 1000ms means 3 measures would be displayed: 0, 500 and 1000
  addMeasure({ JS: 30, UI: 30 });
  expect(onSend).not.toHaveBeenCalledWith("stopMeasuring", undefined);
});

test("it should sanitize data", () => {
  const { addMeasure, expectToMatchSnapshot } = setupPlugin();

  addMeasure({ JS: 120, UI: 150 });

  expectToMatchSnapshot();
});

test("it should handle time being a bit longer than 500ms but still achieving a correct frame count", () => {
  const { addMeasure, renderer } = setupPlugin();

  addMeasure({ JS: 30, UI: 30, time: 502 });

  expect(renderer.baseElement).toHaveTextContent("Average JS FPS59.7");
});
