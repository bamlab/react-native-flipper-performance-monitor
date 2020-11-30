# React Native Performance Monitor Flipper plugin

Experimental for now, **likely to have breaking changes often.**
Only Android is supported for now.

![Lighthouse like example](https://user-images.githubusercontent.com/4534323/93721011-7c254800-fb8d-11ea-955b-95764a99e727.jpeg)

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
import tech.bam.rnperformance.RNPerfMonitorPlugin;

...

client.addPlugin(new RNPerfMonitorPlugin(reactInstanceManager));
```
