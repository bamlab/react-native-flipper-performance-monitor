// @flow

import { AppiumDriver } from "./utils/AppiumDriver";

test("e2e", async () => {
  const driver = await AppiumDriver.create({
    appPackage: "com.example",
    appActivity: "com.example.MainActivity",
  });

  await driver.clickElementById("kill_js");
});
