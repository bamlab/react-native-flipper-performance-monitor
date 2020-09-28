
# react-native-startup-trace

:warning: **You need Firebase performance installed on your project**
See [the Firebase docs](https://rnfirebase.io/perf/usage)

## Getting started

`$ npm install react-native-startup-trace --save`

### Automatic installation

`$ react-native link react-native-startup-trace`

## Usage

In `ios/AppDelegate.m`:

```objc
#import "StartupPerformanceTrace.h"

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
import tech.bam.rnperformance.StartupPerformanceTraceModule;

	...

	@Override
  public void onCreate() {
      super.onCreate();
      SoLoader.init(this, /* native exopackage */ false);

      StartupPerformanceTraceModule.start();
  }
```

In `App.js`
```javascript
import StartupTrace from 'react-native-startup-trace';

const App = () => {
	useEffect(() => StartupTrace.stop(), []);
};
```

### Test it works

Follow [the Firebase Android doc step 4](https://firebase.google.com/docs/perf-mon/get-started-android#view-log-messages) to view the logs.
Then run:
```
adb logcat | grep STARTUP_JS
```
And start the app.