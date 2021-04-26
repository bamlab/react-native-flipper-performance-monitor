import { NativeModules } from "react-native";

NativeModules.StartupPerformanceTrace = {
  stop: jest.fn(),
};

module.exports = require("react-native-startup-trace");
