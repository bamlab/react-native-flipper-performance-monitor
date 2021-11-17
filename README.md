# React Native Performance Monitor Flipper plugin

[![Build Status](https://app.travis-ci.com/bamlab/react-native-performance.svg?branch=master)](https://app.travis-ci.com/bamlab/react-native-performance)

Only Android is supported for now.

![Lighthouse like example](https://user-images.githubusercontent.com/4534323/93721011-7c254800-fb8d-11ea-955b-95764a99e727.jpeg)

This is how the score is calculated below, quite naively, but open to suggestions:
<img width="1050" alt="plugin-score" src="https://user-images.githubusercontent.com/4534323/142174520-ab09e61c-9727-4969-8e1e-a9b688f9fd78.png">

## Install

### Flipper

Search for `rn-perf-monitor` in the list of plugins.

### Install Android plugin

The project is not published on Maven yet, but you can install it as a local dependency:

```sh
yarn add --dev flipper-plugin-rn-performance-android
```

Then add in `./android/settings.gradle`:

```gradle
include ':flipper-plugin-rn-performance-android'
project(':flipper-plugin-rn-performance-android').projectDir = new File(rootProject.projectDir, '../node_modules/flipper-plugin-rn-performance-android')
```

and in `./android/app/build.gradle`:

```gradle
debugImplementation project(':flipper-plugin-rn-performance-android')
```

Finally in `ReactNativeFlipper.java`, add:

```java
import tech.bam.rnperformance.flipper.RNPerfMonitorPlugin;

...

client.addPlugin(new RNPerfMonitorPlugin(reactInstanceManager));
```

## Contributing to flipper Desktopp

1. Clone the repository.
2. Add path to your local `react-native-performance` folder in `~/.flipper/config.json` as shown on [the flipper docs](https://fbflipper.com/docs/extending/loading-custom-plugins/)
3. Run `yarn watch` inside `flipper-desktop`
4. Connect your debug app with the flipper android plugin installed.
5. You should now see your plugin appear in Flipper.
