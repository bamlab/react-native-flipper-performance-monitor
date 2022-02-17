const shell = require("shelljs");

const executeCommand = (command) => {
  return shell.exec(command, { silent: true }).stdout;
};

const bundleId = process.argv[2];
const getPidId = (bundleId) => {
  // Assuming we have only once process
  const [pidId] = executeCommand(`adb shell pidof ${bundleId}`).split("\n");
  return pidId;
};

const getCpuClockTick = () =>
  parseInt(executeCommand(`adb shell getconf CLK_TCK`), 10);

const getRamPageSize = () =>
  parseInt(executeCommand(`adb shell getconf PAGESIZE`), 10);

const pidId = getPidId(bundleId);
const SYSTEM_TICK_IN_ONE_SECOND = getCpuClockTick();
const RAM_PAGE_SIZE = getRamPageSize();
const BYTES_PER_MB = 1024 * 1024;

const pollProcStats = (pidId) => {
  const TIME_INTERVAL_S = 1;
  const pollProcess = shell.exec(
    `{ while true; do adb shell cat /proc/${pidId}/stat | awk '{print $14,$15,$16,$17,$22}';  sleep ${TIME_INTERVAL_S}; done }`,
    { async: true, silent: true }
  );

  let previousTotalCpuTime = null;

  pollProcess.stdout.on("data", function (data) {
    const [utime, stime, cutime, cstime, starttime] = data
      .replace("\n", "")
      .split(" ")
      .map((x) => parseInt(x, 10));
    const totalCpuTime = utime + stime + cutime + cstime;

    const TICKS_FOR_TIME_INTERVAL = SYSTEM_TICK_IN_ONE_SECOND * TIME_INTERVAL_S;

    if (previousTotalCpuTime) {
      console.log(
        (100 * (totalCpuTime - previousTotalCpuTime)) / TICKS_FOR_TIME_INTERVAL
      );
    }
    previousTotalCpuTime = totalCpuTime;
  });
};

const execLoopCommand = (command, interval, dataCallback) => {
  shell
    .exec(`{ while true; do ${command};  sleep ${interval}; done }`, {
      async: true,
      silent: true,
    })
    .stdout.on("data", dataCallback);
};

const pollRamUsage = (pidId) => {
  const TIME_INTERVAL_S = 1;
  const pollProcess = execLoopCommand(
    `adb shell cat /proc/${pidId}/statm | awk '{print $2}'`,
    TIME_INTERVAL_S,
    (data) => {
      console.log((parseInt(data, 10) * RAM_PAGE_SIZE) / BYTES_PER_MB);
    }
  );
};

const pollFpsUsage = (bundleId) => {
  // gfxinfo is one way but we won't get polling, just a final report
  // one of the caveats is Flutter won't be supported
  // https://github.com/flutter/flutter/issues/91406
};

const JS_THREAD_PROCESS_NAME = "(mqt_js)";

const getSubProcessesStats = (pidId) => {
  const data = executeCommand(
    `adb shell "cd /proc/${pidId}/task && ls | tr '\n' ' ' | sed 's/ /\\/stat /g' | xargs cat $1"`
  );

  return data
    .split("\n")
    .filter(Boolean)
    .map((stats) => stats.split(" "))
    .filter(Boolean)
    .map((subProcessStats) => {
      const processId = subProcessStats[0];
      const processName = subProcessStats[1];
      const utime = parseInt(subProcessStats[13], 10);
      const stime = parseInt(subProcessStats[14], 10);
      const cutime = parseInt(subProcessStats[15], 10);
      const cstime = parseInt(subProcessStats[16], 10);
      const cpuNumber = subProcessStats[38];

      const totalCpuTime = utime + stime + cutime + cstime;

      return { processId, processName, totalCpuTime, cpuNumber };
    });
};

const pollCpuPerCoreUsage = (pidId) => {
  let previousTotalCpuTimePerProcessId = {};

  const TIME_INTERVAL_S = 0.5;
  let isFirstMeasure = true;

  /**
   * TODO: using setInterval is probably a bad idea.
   * Should double check that the timings are accurate, otherwise
   * fallback to execute a loop in the device shell and ensure we can handle chunks of data
   **/
  setInterval(() => {
    const subProcessesStats = getSubProcessesStats(pidId);

    const TICKS_FOR_TIME_INTERVAL = SYSTEM_TICK_IN_ONE_SECOND * TIME_INTERVAL_S;

    const groupCpuUsage = (groupByIteratee) =>
      subProcessesStats.reduce(
        (aggr, stat) => ({
          ...aggr,
          [groupByIteratee(stat)]:
            (aggr[groupByIteratee(stat)] || 0) +
            stat.totalCpuTime -
            (previousTotalCpuTimePerProcessId[stat.processId] || 0),
        }),
        {}
      );

    const cpuUsagePerCore = groupCpuUsage((stat) => stat.cpuNumber);
    // Not exactly sure what cpu number-1 is, deleting for now
    delete cpuUsagePerCore["-1"];

    const cpuUsagePerProcessName = groupCpuUsage((stat) => stat.processName);

    const jsThreadUsage = cpuUsagePerProcessName[JS_THREAD_PROCESS_NAME];

    const toPercentage = (value) => (value * 100) / TICKS_FOR_TIME_INTERVAL;

    const logCpuUsagePerCore = () =>
      console.log(
        Object.keys(cpuUsagePerCore)
          .map(
            (cpuNumber) =>
              `Core ${parseInt(cpuNumber, 10) + 1}: ${toPercentage(
                cpuUsagePerCore[cpuNumber]
              )}`
          )
          .join(" | ")
      );

    const logCpuUsagePerProcessName = () =>
      console.log(
        Object.keys(cpuUsagePerProcessName)
          .map(
            (processName) =>
              `${processName}: ${toPercentage(
                cpuUsagePerProcessName[processName]
              )}`
          )
          .join(" | ")
      );

    if (!isFirstMeasure) {
      // logCpuUsagePerCore();
      console.log(toPercentage(jsThreadUsage));
    }
    isFirstMeasure = false;

    previousTotalCpuTimePerProcessId = subProcessesStats.reduce(
      (aggr, curr) => ({
        ...aggr,
        [curr.processId]: curr.totalCpuTime,
      }),
      {}
    );
  }, TIME_INTERVAL_S * 1000);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const findReactNativeApps = async () => {
  const packages = executeCommand("adb shell cmd package list packages")
    .split("\n")
    .map((name) => name.replace("package:", ""));
  console.log(`Found ${packages.length} packages...`);

  for (let index = 0; index < packages.length; index++) {
    const package = packages[index];
    console.log(`Opening package ${index}/${packages.length}: ${package}`);

    executeCommand(` adb shell monkey -p ${package} 1`);
    await sleep(1000);

    const pidId = getPidId(package);
    const subProcesses = getSubProcessesStats(pidId);

    console.log(
      `Trace of JS thread: ${!!subProcesses.find(
        (process) => process.processName === JS_THREAD_PROCESS_NAME
      )}`
    );
    console.log("=======================");
  }
};

// findReactNativeApps();
// pollProcStats(pidId);
// pollRamUsage(pidId);
// pollFpsUsage(bundleId);
pollCpuPerCoreUsage(pidId);
