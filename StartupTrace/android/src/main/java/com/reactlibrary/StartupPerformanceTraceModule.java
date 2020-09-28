package tech.bam.rnperformance;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.Trace;

import javax.annotation.Nonnull;

public class StartupPerformanceTraceModule extends ReactContextBaseJavaModule {
    private static final String REACT_CLASS = "StartupPerformanceTrace";
    private static Trace startupTrace = null;

    StartupPerformanceTraceModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    @Nonnull
    public String getName() {
        return REACT_CLASS;
    }

    public static void start() {
        startupTrace = FirebasePerformance.getInstance().newTrace("STARTUP_JS");
        startupTrace.start();
    }

    @ReactMethod
    public void stop() {
        if (startupTrace != null) {
            startupTrace.stop();
        }
    }
}
