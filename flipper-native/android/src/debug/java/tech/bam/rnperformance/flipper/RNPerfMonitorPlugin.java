package tech.bam.rnperformance.flipper;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.core.FlipperConnection;
import com.facebook.flipper.core.FlipperObject;
import com.facebook.flipper.core.FlipperPlugin;
import com.facebook.flipper.core.FlipperReceiver;
import com.facebook.flipper.core.FlipperResponder;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactApplicationContext;

public class RNPerfMonitorPlugin implements FlipperPlugin {
    private FlipperConnection connection;
    private FPSMonitor fpsMonitor;
    private ReactApplicationContext reactContext;

    public static void passReactApplicationContext(@NonNull ReactApplicationContext reactContext) {
		final RNPerfMonitorPlugin plugin = AndroidFlipperClient.getInstance(reactContext.getBaseContext())
				.getPluginByClass(RNPerfMonitorPlugin.class);

		if (plugin != null) {
			plugin.setReactContext(reactContext);
		} else {
			Log.d(RNPerfMonitorPlugin.class.getName(), "Flipper plugin isn't installed");
		}
	}

	// Keeping this constructor for retrocompatibility
    public RNPerfMonitorPlugin(ReactInstanceManager reactInstanceManager) {
        fpsMonitor = new FPSMonitor();
    }

	public RNPerfMonitorPlugin() {
		fpsMonitor = new FPSMonitor();
	}

    public void setReactContext(@NonNull ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
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
                fpsMonitor.start(reactContext, new MonitorCallback() {
                    @Override
                    public void setCurrentFPS(int uiFrames, int jsFrames, int timeInMs) {
                        if (connection == null) {
                            Log.w("PerfMonitor", "No connection to Flipper");
                            return;
                        }

                        connection.send("addRecord", new FlipperObject.Builder()
                                .put("frameCount", jsFrames)
                                .put("time", timeInMs)
                                .put("thread", "JS")
                                .build());
                        connection.send("addRecord", new FlipperObject.Builder()
                                .put("frameCount", uiFrames)
                                .put("time", timeInMs)
                                .put("thread", "UI")
                                .build());
                    }
                });
            }
        });
    }

    public void stopMeasuring() {
        fpsMonitor.stop();
    }
}
