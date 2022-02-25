#if FB_SONARKIT_ENABLED
#import <Foundation/Foundation.h>

#import <FlipperKit/FlipperPlugin.h>
#import <React/RCTBridge.h>

@interface FlipperPerformancePlugin : NSObject<RCTBridgeModule, FlipperPlugin>

@end

#endif
