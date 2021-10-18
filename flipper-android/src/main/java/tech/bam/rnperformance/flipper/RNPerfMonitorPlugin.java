package tech.bam.rnperformance.flipper;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.flipper.core.FlipperConnection;
import com.facebook.flipper.core.FlipperObject;
import com.facebook.flipper.core.FlipperPlugin;
import com.facebook.flipper.core.FlipperReceiver;
import com.facebook.flipper.core.FlipperResponder;
import com.facebook.react.ReactInstanceManager;

public class RNPerfMonitorPlugin implements FlipperPlugin {
    private FlipperConnection connection;
    private ReactInstanceManager reactInstanceManager;
    private FPSMonitor fpsMonitor;

    public RNPerfMonitorPlugin(ReactInstanceManager reactInstanceManager) {
        this.reactInstanceManager = reactInstanceManager;
        fpsMonitor = new FPSMonitor();
    }


    @Override
    public String getId() {
        return "rn-perf-monitor";
    }

    @Override
    public void onConnect(FlipperConnection connection) throws Exception {
        this.connection = connection;

        connection.receive("startMeasuring", new FlipperReceiver() {
            @Override
            public void onReceive(FlipperObject params, FlipperResponder responder) throws Exception {
                RNPerfMonitorPlugin.this.startMeasuring();
                responder.success();
            }
        });
        connection.receive("stopMeasuring", new FlipperReceiver() {
            @Override
            public void onReceive(FlipperObject params, FlipperResponder responder) throws Exception {
                RNPerfMonitorPlugin.this.stopMeasuring();
                responder.success();
            }
        });
    }

    @Override
    public void onDisconnect() {
        this.connection = null;
    }

    @Override
    public boolean runInBackground() {
        return false;
    }

    public void startMeasuring() {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                fpsMonitor.start(reactInstanceManager.getCurrentReactContext(), new MonitorCallback() {
                    @Override
                    public void setCurrentFPS(int uiFrames, int jsFrames, int expectedFrames) {
                        if (connection == null) {
                            Log.w("PerfMonitor", "No connection to Flipper");
                            return;
                        }

                        final FlipperObject fpsData = new FlipperObject.Builder()
                                .put("JS", jsFrames)
                                .put("UI", uiFrames)
                                .put("expected", expectedFrames)
                                .build();
                        connection.send("addRecord", fpsData);
                    }
                });
            }
        });
    }

    public void stopMeasuring() {
        fpsMonitor.stop();
    }
}
