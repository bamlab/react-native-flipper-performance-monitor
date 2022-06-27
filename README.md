# React Native Performance Monitor Flipper plugin

[![Build Status](https://app.travis-ci.com/bamlab/react-native-flipper-performance-monitor.svg?branch=master)](https://app.travis-ci.com/bamlab/react-native-performance)

![rn-perf-monitor](https://user-images.githubusercontent.com/4534323/151138734-dc9af3b1-1e96-4416-8abd-346597a4dbe8.gif)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)
- [Install](#install)
  - [Flipper](#flipper)
  - [Install for non-Expo projects](#install-for-non-expo-projects)
    - [iOS](#ios)
    - [Android](#android)
    - [Migrating from flipper-plugin-rn-performance-android](#migrating-from-flipper-plugin-rn-performance-android)
  - [Install for Expo projects](#install-for-expo-projects)
    - [Best practice](#best-practice)
- [Contributing](#contributing-to-flipper-desktop)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

[Here's a detailed article](https://blog.bam.tech/developer-news/measuring-and-improving-performance-on-a-react-native-app) to go further

1. Disable _JS Dev Mode_ in the settings (shake your device to open the development menu, then click settings)
2. Click **Start Measuring**
3. Do stuff in your app
4. Check the score!

This is how the score is calculated below, quite naively, but open to suggestions:
<img width="1050" alt="plugin-score" src="https://user-images.githubusercontent.com/4534323/142174520-ab09e61c-9727-4969-8e1e-a9b688f9fd78.png">

Note that:

- the score depends on the device used. We advice using a lower-end device to accentuate performance issues.
- the score depends on what you do on your app while measuring. If you do nothing, your score should (hopefully) be 100!

## Install

### Flipper

Search for `rn-perf-monitor` in the list of plugins.

### Install for non-Expo projects

Install the plugin

```sh
yarn add --dev react-native-flipper-performance-plugin
```

Then go to iOS/Android section below to continue the install

#### iOS

- Run `cd ios && pod install`

Then depending on your RN version:

##### >= v0.68.0

- In `./ios/yourapp/AppDelegate.mm` (where `yourapp` depends on your app), add those 8 lines below:

_(You can check how it's done in [the example folder](https://github.com/bamlab/react-native-performance/blob/master/example/ios/example/AppDelegate.mm))_

```objc
// Add those 4 lines before @implementation AppDelegate
#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperPerformancePlugin.h>
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
// And those 4 lines before RCTAppSetupPrepareApp
#ifdef FB_SONARKIT_ENABLED
  FlipperClient *client = [FlipperClient sharedClient];
  [client addPlugin:[FlipperPerformancePlugin new]];
#endif
  RCTAppSetupPrepareApp(application);
```

##### < 0.68.0

- In `./ios/yourapp/AppDelegate.m` (where `yourapp` depends on your app), add 2 lines:

```objc
#ifdef FB_SONARKIT_ENABLED
...
// Add this line
#import <FlipperPerformancePlugin.h>

static void InitializeFlipper(UIApplication *application) {
  ...

  // Add this line
  [client addPlugin:[FlipperPerformancePlugin new]];

  [client start];
}
#endif
```

#### Android

In `./android/app/src/debug/java/com/yourapp/ReactNativeFlipper.java` (where `com/yourapp` depends on your app), add:

```java
import tech.bam.rnperformance.flipper.RNPerfMonitorPlugin;

...

client.addPlugin(new RNPerfMonitorPlugin());
```

#### Migrating from flipper-plugin-rn-performance-android

You might have previously installed `flipper-plugin-rn-performance-android`. This is now deprecated, as `react-native-flipper-performance-plugin` has autolinking and cross-platform support.

You also need to run these steps:

Uninstall the package:

```
yarn remove flipper-plugin-rn-performance-android
```

Then **remove** those lines in `./android/settings.gradle`:

```gradle
include ':flipper-plugin-rn-performance-android'
project(':flipper-plugin-rn-performance-android').projectDir = new File(rootProject.projectDir, '../node_modules/flipper-plugin-rn-performance-android')
```

and in `./android/app/build.gradle`:

```gradle
debugImplementation project(':flipper-plugin-rn-performance-android')
```

### Install for Expo projects

1. This plugin does not work with Expo Go, since it adds native code. You can use an Expo [custom-dev-client](https://docs.expo.dev/development/getting-started/) instead.

2. Install the **Expo Flipper plugin**. Documentation can be found here: [Expo Community Flipper](https://github.com/jakobo/expo-community-flipper).
   Install the module along with [react-native-flipper](https://www.npmjs.com/package/react-native-flipper):

   _TL;DR_: `yarn add -D expo-community-flipper react-native-flipper`

3. Add `expo-community-flipper` configuration to the `plugins` section of your `app.json`. Please check [Expo Community Flipper documentation](https://github.com/jakobo/expo-community-flipper) if you need further settings.

4. Add the plugin to this library **AFTER** `expo-community-flipper`

```json
{
  "expo": {
    "..."
    "plugins": [
      ["expo-community-flipper"], // first
      ["react-native-flipper-performance-plugin"] // add this after
    ]
  }
}
```

Make sure to run `expo prebuild` or `expo prebuild --clean` afterwards. If the plugin is not recognized on iOS, make sure you call `npx pod-install` or `cd ios && pod install` in the root directory of your project.

#### Best practice

This library helps you to calculate a Lighthouse score similar to PageSpeed Insights. However, the tool is of no use to you if you cannot draw any optimizations from it. That is why it is recommended to use the plugin together with React DevTools.

The easiest way to use React DevTools is to install it as follows:

`yarn add -D react-devtools-core`

Then edit your App.tsx/App.js with following default settings.

```tsx
import { connectToDevTools } from "react-devtools-core";

if (__DEV__) {
  connectToDevTools({
    host: "localhost",
    port: 8097,
  });
}
```

With DevTools you can easily determine why your app is taking too much time for a particular task, most importantly you can find out if you are re-rendering too often. Especially with lists, this can quickly become a knitting trap. Optimize your code and measure the FPS afterwards to get a decent score.

## Contributing to flipper Desktop

1. Clone the repository.
2. Add path to your local `react-native-performance` folder in `~/.flipper/config.json` as shown on [the flipper docs](https://fbflipper.com/docs/extending/loading-custom-plugins/)
3. Run `yarn watch` inside `flipper-desktop`
4. Connect your debug app with the flipper android plugin installed.
5. You should now see your plugin appear in Flipper.
