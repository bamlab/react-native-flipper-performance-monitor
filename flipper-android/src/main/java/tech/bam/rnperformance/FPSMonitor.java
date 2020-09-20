package tech.bam.rnperformance;

import android.os.Handler;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.debug.FpsDebugFrameCallback;

interface MonitorCallback {
    void setCurrentFPS(
            int uiFrames,
            int jsFrames,
            int expectedFrames
    );
}

public class FPSMonitor {
    public FpsDebugFrameCallback frameCallback;
    private FPSMonitorRunnable runnable;
    private MonitorCallback monitorCallback;

    public void start(ReactContext reactContext, MonitorCallback monitorCallback) {
        frameCallback = new FpsDebugFrameCallback(reactContext);
        this.monitorCallback = monitorCallback;
        runnable = new FPSMonitorRunnable();

        frameCallback.start();
        runnable.start();
    }

    public void stop() {
        frameCallback.stop();
        frameCallback.reset();
        runnable.stop();
    }

    private class FPSMonitorRunnable implements Runnable {

        private boolean mShouldStop = false;
        private int mTotalFramesDropped = 0;
        private int mTotal4PlusFrameStutters = 0;

        private static final int UPDATE_INTERVAL_MS = 500;

        final Handler handler = new Handler();

        @Override
        public void run() {
            if (mShouldStop) {
                return;
            }

            mTotalFramesDropped += frameCallback.getExpectedNumFrames() - frameCallback.getNumFrames();
            mTotal4PlusFrameStutters += frameCallback.get4PlusFrameStutters();
            monitorCallback.setCurrentFPS(
                    frameCallback.getNumFrames(),
                    frameCallback.getNumJSFrames(),
                    frameCallback.getExpectedNumFrames()
            );
            frameCallback.reset();

            handler.postDelayed(this, UPDATE_INTERVAL_MS);
        }

        public void start() {
            mShouldStop = false;
            handler.post(this);
        }

        public void stop() {
            mShouldStop = true;
        }
    }
}