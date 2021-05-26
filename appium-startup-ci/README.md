# Appium Startup script

Use this to measure your app startup time with Appium

## Installation

```shell
git clone git@github.com:bamlab/react-native-performance.git
cd  appium-startup-ci
yarn
```

## Usage

Replace `APPS` in `appium.test.ts` by the apps you want to test.

Then:

```sh
# Do this in a terminal
yarn appium
# Do this in a separate terminal
yarn jest appium.test.ts
```
