# React Native Performance Monitor Flipper plugin

[![Build Status](https://app.travis-ci.com/bamlab/react-native-performance.svg?branch=master)](https://app.travis-ci.com/bamlab/react-native-performance)

Only Android is supported for now. Add a 👍 on [this issue](https://github.com/bamlab/react-native-performance/issues/18) if you want to see iOS support.

![rn-perf-monitor](https://user-images.githubusercontent.com/4534323/151138734-dc9af3b1-1e96-4416-8abd-346597a4dbe8.gif)

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

### Install Android/iOS plugin

Install the plugin

```sh
yarn add --dev react-native-flipper-performance-plugin
```

Then go to iOS/Android section below to continue the install

#### iOS

#### Android

In `./android/app/src/debug/java/com/yourapp/ReactNativeFlipper.java` (where `com/yourapp` depends on your app), add:

```java
import tech.bam.rnperformance.flipper.RNPerfMonitorPlugin;

...

client.addPlugin(new RNPerfMonitorPlugin(reactInstanceManager));
```

#### Migrating from flipper-plugin-rn-performance-android

You might have previously installed `flipper-plugin-rn-performance-android`. This is now deprecated, as `react-native-flipper-performance-plugin` has autolinking and cross-platform support.

You also need to run these steps:

Uninstall the package:

```
yarn remove --dev react-native-flipper-performance-plugin
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

## Contributing to flipper Desktop

1. Clone the repository.
2. Add path to your local `react-native-performance` folder in `~/.flipper/config.json` as shown on [the flipper docs](https://fbflipper.com/docs/extending/loading-custom-plugins/)
3. Run `yarn watch` inside `flipper-desktop`
4. Connect your debug app with the flipper android plugin installed.
5. You should now see your plugin appear in Flipper.
