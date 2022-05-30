import "@testing-library/jest-dom";

// See https://github.com/facebook/flipper/pull/3327
// @ts-ignore
global.electronRequire = require;
require("@testing-library/react");
