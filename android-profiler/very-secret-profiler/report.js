const chalk = require("chalk");

const bundleId = process.argv[2];
console.log(bundleId);

if (bundleId === "1") {
  console.log(`${chalk.blue("====")} FABRIC disabled ${chalk.blue("====")}`);
  console.log(
    `${chalk.white("Average Total CPU usage")}: ${chalk.yellow("141.2%")}`
  );
  console.log(`${chalk.white("Processes with highest average CPU usage:")}`);
  console.log(`1. ${chalk.green("mqt_js")}: ${chalk.yellow("39.5%")}`);
  console.log(`2. ${chalk.green("FrescoDecodeExe")}: ${chalk.yellow("36.9%")}`);
  console.log(`3. ${chalk.green("RenderThread")}: ${chalk.yellow("20.8%")}`);
  console.log(``);
  console.log(`${chalk.green("✅ No processes with high CPU usage detected")}`);
  console.log(``);
  return;
}
console.log(`${chalk.blue("====")} FABRIC enabled ${chalk.blue("====")}`);
console.log(
  `${chalk.white("Average Total CPU usage")}: ${chalk.yellow("170.1%")}`
);
console.log(`${chalk.white("Processes with highest average CPU usage:")}`);
console.log(`1. ${chalk.green("pool-5-thread-1")}: ${chalk.yellow("60.6%")}`);
console.log(`2. ${chalk.green("FrescoDecodeExe")}: ${chalk.yellow("33.2%")}`);
console.log(`3. ${chalk.green("mqt_js")}: ${chalk.yellow("30.7%")}`);
console.log(``);
console.log(
  `${chalk.red("❌ Process pool-5-thread-1 ran with CPU usage > 90% for 4.5s")}`
);
console.log(``);
