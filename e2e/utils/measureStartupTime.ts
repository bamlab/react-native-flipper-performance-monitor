import { AppiumDriver } from "./AppiumDriver";

const shell = require('shelljs');
const runCommand = (command: string) =>
  shell.exec(command).stdout;

const stopApp = (bundleId: string) => runCommand(`adb shell am force-stop ${bundleId}`);
const startApp = (bundleId: string) => runCommand(`adb shell monkey -p ${bundleId} 1`);

interface StartupTimeOptions {
  beforeRestart?: () => Promise<any>;
  checkIsStarted: () => Promise<any>;
  bundleId: string
};

const measureStartupTime = async ({beforeRestart, checkIsStarted, bundleId}: StartupTimeOptions) => {
  const performance = require('perf_hooks').performance;
  if (beforeRestart) await beforeRestart();
  stopApp(bundleId);

  const beginning = performance.now();
  startApp(bundleId);
  await checkIsStarted();

  return performance.now() - beginning;
};

interface TestOptions extends Omit<Omit<StartupTimeOptions, "checkIsStarted">, "beforeRestart"> {
  createDriver: () => Promise<AppiumDriver>,
  checkIsStarted: (driver: AppiumDriver) => Promise<any>,
  beforeRestart?: (driver: AppiumDriver) => Promise<any>,
}

const runAppiumStartupTimeTest = async (options: TestOptions) => {
  const driver = await options.createDriver();

  const startupTime = await measureStartupTime({
    ...options, 
    checkIsStarted: () => options.checkIsStarted(driver), 
    beforeRestart: options.beforeRestart ? () => options.beforeRestart(driver) : null, 
  });

  await driver.client.deleteSession();

  return startupTime;
};

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const runAppiumAverageStartupTimeTest = async (options: TestOptions & {
  measureCount: number
}) => {
  const measures = [];

  for (let index = 0; index < options.measureCount; index++) {
    const startupTime = await runAppiumStartupTimeTest(options);
    // Wait between tests to avoid some econnreset errors
    await new Promise(resolve => setTimeout(resolve, 10000));
    measures.push(startupTime);
  }

  return {
    measures,
    average: average(measures)
  };
}
