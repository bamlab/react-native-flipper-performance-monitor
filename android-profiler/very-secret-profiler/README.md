# 🔥 Very secret profiler 🔥

This is still a POC in the experimental stage.  
The goal is to be able to measure the performance of any app in production on Android. 🤩

## Features coming

- Publish a CLI package 🚀
- Integrate measures with the Flipper plugin 🔥
- Show RAM usage
- Show full CPU usage
- Show CPU usage per process and CPU core

For instance, this is me profiling the Coinbase app in production:

![coinbase-profiling](https://user-images.githubusercontent.com/4534323/154450010-14069401-b686-4ff3-9f52-c404e6e4ed6c.gif)

## FAQ

### Will this replace the Flipper plugin in the same repo?

I think they can complement each other.

1. I plan to integrate the measures from this profiler in the Flipper plugin
2. The Flipper plugin should be more accurate with FPS data
3. Also this profiler will probably never support iOS

## Usage

```
# This will print out JS Thread CPU Usage every 500ms
npx react-native-profiler com.coinbase.android
```

If you need to find an app's bundle id:

```
adb shell dumpsys window windows | grep -E 'mCurrentFocus|mFocusedApp|mInputMethodTarget|mSurface'
```

If you want a nice graph in your terminal, you can use [ttyplot](https://github.com/tenox7/ttyplot) and run:

```
npx react-native-profiler com.coinbase.android | ttyplot -s 100 -t "JS Thread CPU usage %" -u "%"
```
