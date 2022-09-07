const chalk = require("chalk");
const responseTime = require("response-time");
const { ValidationError } = require("express-json-validator-middleware");

const {
  fnDuration,
  freeMemory,
  httpStatus,
  methodName,
  logDate,
  writeToLogs,
  startLogTime,
} = require("../utils/genericUtils");

// ----------------------------  Middlewares ------------------------------------------------//
const logger = responseTime((req, res, time) => {
  let trimmedTime = Math.ceil(time);

  const duration = fnDuration(trimmedTime);

  if (res.statusCode > 400) {
    res.apiDuration = { time: trimmedTime };
  } else {
    const log = `${startLogTime()} | ${methodName(req.method)} | ${chalk.cyan(
      req.url
    )} | ${duration} | ${httpStatus(
      res.statusCode,
      req.protocol
    )} | ${freeMemory()}`;
    writeToLogs(logDate(), log);
    console.log(log);
  }
});

const errorLogger = (err, req, res, next) => {
  const isValidationError = err instanceof ValidationError;
  let prettyMessage;
  if (!isValidationError) {
    const errorObj = JSON.parse(err);
    res.header("Content-Type", "application/json");
    prettyMessage = JSON.stringify(errorObj.message);
    res.status(errorObj.status).send(prettyMessage, null, 4);
  } else {
    prettyMessage = JSON.stringify(err.validationErrors);
  }

  const duration = fnDuration(
    res && res.apiDuration ? res.apiDuration.time : 0
  );

  const log = `${startLogTime()} | ${methodName(req.method)} | ${chalk.cyan(
    req.originalUrl
  )} | ${duration} | ${httpStatus(
    res.statusCode,
    req.protocol
  )} | ${freeMemory()} | ${chalk.red(prettyMessage)}`;

  console.log(log);
  writeToLogs(logDate(), log);
};

module.exports = {
  // responseTimeVal,
  logger,
  errorLogger,
};
