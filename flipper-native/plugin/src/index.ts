import {
  withDangerousMod,
  ConfigPlugin,
  WarningAggregator,
  withAppDelegate,
  ExportedConfigWithProps,
} from "@expo/config-plugins";
import {
  mergeContents,
  MergeResults,
  removeContents,
} from "@expo/config-plugins/build/utils/generateCode";
import path from "path";
import fs from "fs";
import { ExpoConfig } from "@expo/config-types";

function modifyAppDelegateImport(src: string): MergeResults {
  const newSrc = `#ifdef FB_SONARKIT_ENABLED
  #import <FlipperKit/FlipperClient.h>
  #import <FlipperPerformancePlugin.h>
#endif`;

  return mergeContents({
    tag: "react-native-performance-plugin-expo-import",
    src,
    newSrc,
    anchor: /@implementation AppDelegate/,
    offset: -1,
    comment: "//",
  });
}

function modifyAppDelegateLaunchingCode(src: string): MergeResults {
  const newSrc = `  #ifdef FB_SONARKIT_ENABLED
    FlipperClient * client = [FlipperClient sharedClient];
    [client addPlugin: [FlipperPerformancePlugin new]];
  #endif`;

  return mergeContents({
    tag: "react-native-performance-plugin-expo-launchingcode",
    src,
    newSrc,
    anchor: /didFinishLaunchingWithOptions:/,
    offset: 2,
    comment: "//",
  });
}

function withIosPlugin(config: ExpoConfig) {
  return withAppDelegate(config, (config) => {
    if (["objc", "objcpp"].includes(config.modResults.language)) {
      config.modResults.contents = modifyAppDelegateImport(
        config.modResults.contents
      ).contents;
      config.modResults.contents = modifyAppDelegateLaunchingCode(
        config.modResults.contents
      ).contents;
    } else {
      WarningAggregator.addWarningIOS(
        "withReactNativePerformanceFlipperPlugin",
        `Cannot setup react-native-performance for Expo, the project AppDelegate is not a supported language: ${config.modResults.language}`
      );
    }
    return config;
  });
}

async function readFileAsync(path: string) {
  return fs.promises.readFile(path, "utf8");
}

async function saveFileAsync(path: string, content: string) {
  return fs.promises.writeFile(path, content, "utf8");
}

function getDebugRoot(projectRoot: string) {
  return path.join(projectRoot, "android", "app", "src", "debug", "java");
}

async function addReactNativePerformancePluginForExpoAndroid(
  config: ExportedConfigWithProps
) {
  if (config.android) {
    const projectRoot = config.modRequest.projectRoot;
    const packageDebugRoot = getDebugRoot(projectRoot);
    const packageName = config.android.package || "";
    const reactNativeFlipperFilePath = path.join(
      packageDebugRoot,
      `${packageName.split(".").join("/")}/ReactNativeFlipper.java`
    );

    try {
      // since there is no mod to get the contents of the file, we need to read it first
      const reactNativeFlipperContents = await readFileAsync(
        reactNativeFlipperFilePath
      );

      // store it for later use
      let patchedContents = reactNativeFlipperContents;

      // modify the contents of the file
      patchedContents = mergeContents({
        tag: "react-native-performance-plugin-expo-import",
        src: patchedContents,
        newSrc: "import tech.bam.rnperformance.flipper.RNPerfMonitorPlugin;",
        anchor: "import okhttp3.OkHttpClient;",
        offset: 1,
        comment: "//",
      }).contents;

      // modify the contents of the file
      patchedContents = mergeContents({
        tag: "react-native-performance-plugin-expo-addplugin",
        src: patchedContents,
        newSrc: `      client.addPlugin(new RNPerfMonitorPlugin());`,
        anchor: /client.start()/g,
        offset: -1,
        comment: "//",
      }).contents;

      // save the file
      return await saveFileAsync(reactNativeFlipperFilePath, patchedContents);
    } catch (e) {
      // TODO: should we throw instead?
      WarningAggregator.addWarningAndroid(
        "react-native-performance Expo Plugin",
        `Couldn't modify ReactNativeFlipper.java - ${e}.`
      );
    }
  }
}

const withAndroidPlugin: ConfigPlugin = (config: ExpoConfig) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      await addReactNativePerformancePluginForExpoAndroid(config);
      return config;
    },
  ]);
};

export const withReactNativePerformanceFlipperPluginExpo: ConfigPlugin = (
  config
) => {
  config = withIosPlugin(config);
  config = withAndroidPlugin(config);
  return config;
};

export default withReactNativePerformanceFlipperPluginExpo;
