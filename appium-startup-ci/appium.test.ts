// @flow

import * as webdriver from "webdriverio";
import { toMatchImageSnapshot } from "jest-image-snapshot";
import { AppiumDriver } from "./utils/AppiumDriver";
import { runAppiumAverageStartupTimeTest } from "./utils/measureStartupTime";

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchImageSnapshot({ customSnapshotIdentifier: string }): R;
    }
  }
}

const TEN_MINUTES = 600000;
const TIMEOUT = TEN_MINUTES;

// Allow tests to take as much time as needed, in any case Bitrise will kill the test if it hangs
const A_LOT_OF_TIME = 10 * TEN_MINUTES;
jest.setTimeout(A_LOT_OF_TIME);
expect.extend({ toMatchImageSnapshot });

const shell = require("shelljs");
const runCommand = (command: string) => shell.exec(command).stdout;

const stopApp = (bundleId: string) =>
  runCommand(`adb shell am force-stop ${bundleId}`);
const startApp = (bundleId: string) =>
  runCommand(`adb shell monkey -p ${bundleId} 1`);

interface Capabilities {
  appWaitActivity?: string;
}

const getAppOptions = (bundleId: string, capabilities: Capabilities) => ({
  path: "/wd/hub",
  port: 4723,
  connectionRetryTimeout: TEN_MINUTES,
  capabilities: {
    platformName: "Android",
    deviceName: "Android Emulator",
    app: `${bundleId}.apk`,
    // Find activity with adb shell dumpsys window windows | grep -E 'mCurrentFocus|mFocusedApp'
    // Or $ANDROID_HOME/build-tools/30.0.2/aapt dump xmltree com.citymapper.app.release.apk AndroidManifest.xml
    // appActivity: "com.citymapper.app.release/com.citymapper.app.EntryPointActivity",
    automationName: "UiAutomator2",
    androidInstallTimeout: TEN_MINUTES,
    adbExecTimeout: TEN_MINUTES,
    autoGrantPermissions: true,
    appWaitActivity: capabilities?.appWaitActivity,
  },
});

interface App {
  appName: string;
  apkPath: string;
  bundleId: string;
  capabilities?: Capabilities;
  beforeRestart?: (driver: AppiumDriver) => Promise<any>;
  checkIsStarted: (driver: AppiumDriver) => Promise<any>;
}

const STARTUP_TIMES: {
  [appName: string]: {
    measures: number[];
    average: number;
  };
} = {};

// Example of app
const blankReactNative: App = {
  appName: "Blank RN app",
  bundleId: "com.blankapp",
  apkPath: "com.blankapp.apk",
  checkIsStarted: (driver) => driver.findElementByText("Step One"),
};

const APPS = [blankReactNative];

test.each(APPS)(
  `Measure %s startup`,
  async ({
    appName,
    apkPath,
    bundleId,
    capabilities,
    beforeRestart,
    checkIsStarted,
  }: App) => {
    console.log(`MEASURING ${appName}`);

    const createDriver = async () => {
      const client: webdriver.BrowserObject = await webdriver.remote(
        getAppOptions(apkPath, capabilities)
      );
      const driver = new AppiumDriver({
        client,
        timeout: TIMEOUT,
        platform: "android",
      });
      return driver;
    };

    const report = await runAppiumAverageStartupTimeTest({
      bundleId: bundleId,
      createDriver,
      measureCount: 10,
      beforeRestart,
      checkIsStarted,
    });

    console.log(report);

    STARTUP_TIMES[appName] = report;

    // Wait between tests to avoid some econnreset errors
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
);

afterAll(async () => {
  console.log(STARTUP_TIMES);
});
