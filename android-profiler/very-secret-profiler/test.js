#!/usr/bin/env node

const shell = require("shelljs");
const mapValues = require("lodash/mapValues");
const _ = require("lodash");

const DEBUG = false;

const executeCommand = (command) => {
  return shell.exec(command, { silent: !DEBUG }).stdout;
};

const scrollDown = () =>
  executeCommand("adb shell input swipe 500 1000 500 200 10");
const scrollUp = () =>
  executeCommand("adb shell input swipe 500 200 500 1000 10");
const sleep = (seconds) => executeCommand(`sleep ${seconds}`);

for (let index = 0; index < 5; index++) {
  scrollDown();
  sleep(1);
}

for (let index = 0; index < 5; index++) {
  scrollUp();
  sleep(1);
}
