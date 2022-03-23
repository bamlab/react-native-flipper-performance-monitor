import * as webdriver from "webdriverio";
import { GestureHandler } from "./GestureHandler";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

const TEN_MINUTES = 600000;

// Allow tests to take as much time as needed, in any case Bitrise will kill the test if it hangs
const A_LOT_OF_TIME = 10 * TEN_MINUTES;
jest.setTimeout(A_LOT_OF_TIME);

export class AppiumDriver {
  client: webdriver.BrowserObject;
  gestures: GestureHandler;
  timeout: number;

  constructor({ client }: { client: webdriver.BrowserObject }) {
    this.client = client;
    this.timeout = 10000;
    this.gestures = new GestureHandler(client);
  }

  static async create({
    appPackage,
    appActivity,
    ...clientCapabilities
  }: webdriver.BrowserObject["capabilities"]) {
    const client = await webdriver.remote({
      path: "/wd/hub",
      port: 4723,
      capabilities: {
        platformName: "Android",
        automationName: "UiAutomator2",
        appPackage: "fr.pmu.hippique",
        appActivity: "fr.pmu.pump.MainActivity",
        // See https://github.com/appium/appium/blob/1e30207ec4e413c64396420fbb0388392e88cc54/docs/en/writing-running-appium/other/reset-strategies.md
        noReset: true,
        autoLaunch: false,
        ...clientCapabilities,
      },
    });

    return new AppiumDriver({ client });
  }

  async wait(delay: number) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async takeScreenShot(screenName: string) {
    // Make sure screen is fully render by waiting an arbitrary amount of time
    const TEN_SECONDS = 10000;
    await this.wait(TEN_SECONDS);

    const screen = await this.client.$(
      "/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout"
    );
    const id = screen.elementId;
    const base64Image = await this.client.takeElementScreenshot(id);
    expect(base64Image).toMatchImageSnapshot({
      customSnapshotIdentifier: screenName,
    });
  }

  async byText(text: string) {
    return this.client.$(`//*[@text='${text}']`);
  }

  async waitForElement(element: webdriver.Element) {
    await element.waitForExist({ timeout: this.timeout, interval: 100 });
  }

  async takeScreenshotOnFailure(
    command: () => Promise<void>,
    errorScreenshotName: string
  ) {
    try {
      await command();
    } catch (error) {
      await this.takeScreenShot(`ERROR_${errorScreenshotName}`);
      throw error;
    }
  }

  xpathByResourceId(id: string) {
    return `//android.view.ViewGroup[contains(@resource-id, "${id}")]`;
  }

  async findElementsById(testID: string) {
    return await this.client.$$(this.xpathByResourceId(testID));
  }

  async findElementById(testID: string) {
    return await this.client.$(this.xpathByResourceId(testID));
  }

  async logResourceIds() {
    const elements = await this.client.$$(
      "//android.view.ViewGroup[@resource-id=${testID}]"
    );
    const clickableElements = [];
    for (const element of elements) {
      if (await element.getAttribute("clickable")) {
        clickableElements.push(await element.getAttribute("resource-id"));
      }
    }

    console.log("HELLO", clickableElements.filter(Boolean));
  }

  async findElementByText(text: string) {
    const element = await this.byText(text);
    await this.takeScreenshotOnFailure(
      () => this.waitForElement(element),
      `${text}_NOT_FOUND`
    );

    return element;
  }

  async clickElementById(id: string) {
    const element = await this.findElementById(id);
    return await element.click();
  }

  async clickElementByText(text: string) {
    const element = await this.findElementByText(text);
    return await element.click();
  }

  async switchToAppContext() {
    return await this.client.switchContext("NATIVE_APP");
  }

  async switchToWebviewContext(bundleId: string) {
    return await this.client.switchContext(`WEBVIEW_${bundleId}`);
  }
}
