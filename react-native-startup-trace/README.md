
# react-native-startup-trace

:warning: **You need Firebase performance installed on your project**
See [the Firebase docs](https://rnfirebase.io/perf/usage)

## Getting started

`$ npm install react-native-startup-trace --save`

## Usage

In `ios/AppDelegate.m`:

```objc
#import <StartupTrace.h>

...

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
	...

	// After Firebase initialization
	[StartupPerformanceTrace start];

	...
	return YES;
}
```

In `MainApplication.java`

```java
import tech.bam.rnperformance.startuptrace.StartupTraceModule;

	...

	@Override
  public void onCreate() {
      super.onCreate();
      SoLoader.init(this, /* native exopackage */ false);

      StartupTraceModule.start();
  }
```

In `App.js`
```javascript
import { useStopStartupTrace } from 'react-native-startup-trace';

const App = () => {
	useStopStartupTrace();

	return (
		...
	)
};
```

### Test it works

#### Android

Follow [the Firebase Android doc step 4](https://firebase.google.com/docs/perf-mon/get-started-android#view-log-messages) to view the logs.
Then run:
```
adb logcat | grep STARTUP_JS
```
And start the app.

You should see something similar to:

```
FirebasePerformance: Logging trace metric - STARTUP_JS 2423.1650ms
```

## Usage with jest

Import the mock in the setupFiles of your `jest.config.js`:

```javascript
setupFiles: ["./node_modules/react-native-startup-trace/jest.setup.js"];
```
