package tech.bam.rnperformance.flipper;

import android.os.Handler;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

@ReactModule(name = FlipperPerformancePluginModule.NAME)
public class FlipperPerformancePluginModule extends ReactContextBaseJavaModule {
    public static final String NAME = "FlipperPerformancePlugin";

    public FlipperPerformancePluginModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void killUIThread(int intensity, Promise promise) {
        final Handler mainHandler = new Handler(getReactApplicationContext().getMainLooper());
        mainHandler.post(() -> promise.resolve(fibonacci(intensity)));
    }

    private int fibonacci(int n) {
        return n < 1 ? 0 : n <= 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
    }
}
