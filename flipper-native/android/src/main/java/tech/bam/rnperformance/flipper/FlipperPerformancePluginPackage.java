package tech.bam.rnperformance.flipper;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FlipperPerformancePluginPackage implements ReactPackage {
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new FlipperPerformancePluginModule(reactContext));

		if (BuildConfig.DEBUG) {
			passReactContextToFlipperPlugin(reactContext);
		}

        return modules;
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    private void passReactContextToFlipperPlugin(@NonNull ReactApplicationContext reactContext) {
		try {
			/*
			 We use reflection since Flipper library is not available in release mode
			 We pass React context here, for compatibility with expo apps
			 See https://github.com/expo/expo/issues/17852
			*/
			Class<?> aClass = Class.forName("tech.bam.rnperformance.flipper.RNPerfMonitorPlugin");
			aClass
					.getMethod("passReactApplicationContext", ReactApplicationContext.class)
					.invoke(null, reactContext);
		} catch (ClassNotFoundException | NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
			e.printStackTrace();
		}
	}
}
