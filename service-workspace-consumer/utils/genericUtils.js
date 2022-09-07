const os = require("os");
const fs = require("fs");
const moment = require("moment");
const chalk = require("chalk");
const stripAnsi = require("strip-ansi");

const freeMemory = () =>
  `${chalk.blueBright(`${Math.floor(os.freemem() / 10 ** 9)}GB`)}`;

const fnDuration = (trimmedTime) => {
  const slow = trimmedTime > 7000;
  return `${
    slow
      ? chalk.red(`${trimmedTime / 1000}s`)
      : chalk.green(`${trimmedTime / 1000}s`)
  }`;
};

const logDate = () => moment().format(`MM-DD-YYYY`);

const writeToLogs = (logDate, log) => {
  const value = new Buffer(stripAnsi(log + "\n\n")).toString("base64");
  fs.appendFile(
    `logs/${logDate}-request_logs.txt`,
    value,
    { encoding: "utf8" },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

const startLogTime = () =>
  chalk.yellow(moment().format(`MM-DD-YYYYTHH:mm:ss:SSZ`));

const handleException = (req, err, status) =>
  `${JSON.stringify({
    ...(req.body ? req.body : {}),
    api: req.originalUrl,
    message: err.stack,
    status,
  })}`;

const methodName = (method) => `${chalk.magenta(method)}`;

const httpStatus = (statusCode, protocol) =>
  `${
    statusCode >= 400
      ? chalk.red(`${protocol.toUpperCase()} ${statusCode}`)
      : chalk.green(`${protocol.toUpperCase()} ${statusCode}`)
  }`;

module.exports = {
  fnDuration,
  freeMemory,
  logDate,
  writeToLogs,
  startLogTime,
  handleException,
  methodName,
  httpStatus,
};
