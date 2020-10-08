//  Created by react-native-create-bridge

#import "StartupTrace.h"

// import RCTBridge
#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include(“RCTBridge.h”)
#import “RCTBridge.h”
#else
#import “React/RCTBridge.h” // Required when used as a Pod in a Swift project
#endif

// import RCTEventDispatcher
#if __has_include(<React/RCTEventDispatcher.h>)
#import <React/RCTEventDispatcher.h>
#elif __has_include(“RCTEventDispatcher.h”)
#import “RCTEventDispatcher.h”
#else
#import “React/RCTEventDispatcher.h” // Required when used as a Pod in a Swift project
#endif

@implementation StartupPerformanceTrace
@synthesize bridge = _bridge;

static FIRTrace *_startupTrace = nil;

+ (FIRTrace *)startupTrace {
  return _startupTrace;
}

RCT_EXPORT_MODULE();

+ (void)start {
  _startupTrace = [[FIRPerformance sharedInstance] traceWithName:@"STARTUP_JS"];
  [_startupTrace start];
}

RCT_EXPORT_METHOD(stop)
{
  if (_startupTrace) {
    [_startupTrace stop];
  }
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

+ (BOOL)requiresMainQueueSetup { return YES; }

@end
