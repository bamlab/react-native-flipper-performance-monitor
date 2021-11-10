import { fireEvent } from "@testing-library/dom";
import { TestUtils } from "flipper-plugin";
import * as Plugin from "..";

// See https://github.com/apexcharts/react-apexcharts/issues/52
jest.mock("react-apexcharts", () => "apex-charts");
jest.mock("apexcharts", () => ({ exec: jest.fn() }));

test("displays FPS data and scoring", async () => {
  const { renderer, sendEvent, onSend } = TestUtils.renderPlugin(Plugin);

  fireEvent.click(renderer.getByText("Start"));
  expect(onSend).toHaveBeenCalledWith("startMeasuring", undefined);

  sendEvent("addRecord", {
    JS: 30,
    UI: 25,
    expected: 30,
  });
  sendEvent("addRecord", {
    JS: 0,
    UI: 30,
    expected: 30,
  });

  onSend.mockClear();

  fireEvent.click(renderer.getByText("Stop"));
  expect(onSend).toHaveBeenCalledWith("stopMeasuring", undefined);

  expect(
    (renderer.baseElement as HTMLBodyElement).textContent
  ).toMatchSnapshot();
  expect(renderer.baseElement).toMatchSnapshot();
});
