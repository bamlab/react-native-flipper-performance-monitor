import * as webdriver from "webdriverio";
import { GestureHandler } from "./GestureHandler";

export class AppiumDriver {
  client: webdriver.BrowserObject;
  gestures: GestureHandler;
  timeout: number;
  platform: "android" | "ios";

  constructor({
    client,
    timeout,
    platform,
  }: {
    client: webdriver.BrowserObject;
    timeout: number;
    platform: "android" | "ios";
  }) {
    this.client = client;
    this.timeout = timeout;
    this.gestures = new GestureHandler(client);
  }

  async wait(delay: number) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async takeScreenShot(screenName: string) {
    // Make sure screen is fully render by waiting an arbitrary amount of time
    const TEN_SECONDS = 10000;
    await this.wait(TEN_SECONDS);

    const screen = await this.client.$("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout");
    const id = screen.elementId;
    const base64Image = await this.client.takeElementScreenshot(id);
    expect(base64Image).toMatchImageSnapshot({ customSnapshotIdentifier: screenName });
  }

  async byText(text: string) {
    return this.platform === "ios" ? this.client.$(`//*[@label='${text}']`) : this.client.$(`//*[@text='${text}']`);
  }

  async waitForElement(element: webdriver.Element) {
    await element.waitForExist({ timeout: this.timeout, interval: 100 });
  }

  async takeScreenshotOnFailure(command: () => Promise<void>, errorScreenshotName: string) {
    try {
      await command();
    } catch (error) {
      await this.takeScreenShot(`ERROR_${errorScreenshotName}`);
      throw error;
    }
  }

  async findElementById(testID: string) {
    const element = await this.client.$(`~${testID}`);
    await this.takeScreenshotOnFailure(() => this.waitForElement(element), `${testID}_NOT_FOUND`);

    return element;
  }

  async findElementByText(text: string) {
    const element = await this.byText(text);
    await this.takeScreenshotOnFailure(() => this.waitForElement(element), `${text}_NOT_FOUND`);

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

  async switchToWebviewContext() {
    return await this.client.switchContext("WEBVIEW_com.uefa.euro2016.debug");
  }
}
