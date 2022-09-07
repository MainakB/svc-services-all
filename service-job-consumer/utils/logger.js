const chalk = require("chalk");

const {
  fnDuration,
  freeMemory,
  logDate,
  writeToLogs,
  startLogTime,
} = require("./genericUtils");

const createLogFormat = (str, logLevel, functionName, duration) => {
  const methodName = `${chalk.magenta(logLevel)}`;
  const fnName = `${chalk.cyan(functionName)}`;

  const log = `${startLogTime()} | ${methodName} | ${fnName} | ${fnDuration(
    duration
  )} | ${freeMemory()} | ${str}`;
  return log;
};

const debug = (str, fnPosition, duration) => {
  const stack = new Error().stack.split("at ");
  const functionStack =
    stack[stack.length > fnPosition && fnPosition ? fnPosition : 2].trim();
  const localeStr = ".";

  let fnName = functionStack.substring(
    functionStack.indexOf(localeStr) + localeStr.length,
    functionStack.indexOf("(")
  );
  const log = `${createLogFormat(str, "DEBUG", fnName, duration)}`;
  console.log(log);
  // writeToLogs(logDate(), log);
};

module.exports = {
  debug,
};
