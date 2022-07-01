#import <Foundation/Foundation.h>

#if __has_include(<FlipperKit/FlipperPlugin.h>)
#import <FlipperKit/FlipperPlugin.h>
#import <React/RCTBridge.h>

@interface FlipperPerformancePlugin : NSObject<RCTBridgeModule, FlipperPlugin>

@end

#else
@interface FlipperPerformancePlugin : NSObject

@end
#endif
