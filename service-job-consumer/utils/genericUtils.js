const os = require("os");
const fs = require("fs");
const moment = require("moment");
const chalk = require("chalk");
const stripAnsi = require("strip-ansi");

const buildCiToolsResponse = (resultCiTypes) => {
  try {
    return resultCiTypes.rows.reduce((acc, val) => {
      acc = {
        ...acc,
        [val.ci_tool_name]: val.ci_tool_name,
      };
      return acc;
    }, {});
  } catch (err) {
    console.error("genericUtil(buildCiToolsResponse) : ", err);
    throw err;
  }
};

const startLogTime = () =>
  chalk.yellow(moment().format(`MM-DD-YYYYTHH:mm:ss:SSZ`));

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

const getJobNameFromBuildUrl = (api_url) => {
  let jobName = api_url.substring(0, api_url.lastIndexOf("/"));
  jobName = `${jobName.substring(0, jobName.lastIndexOf("/"))}/`;
  return jobName;
};

const logDate = () => moment().format(`MM-DD-YYYY`);

const methodName = (method) => `${chalk.magenta(method)}`;

const httpStatus = (statusCode, protocol) =>
  `${
    statusCode >= 400
      ? chalk.red(`${protocol.toUpperCase()} ${statusCode}`)
      : chalk.green(`${protocol.toUpperCase()} ${statusCode}`)
  }`;

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

const handleException = (req, err, status) =>
  `${JSON.stringify({
    ...(req.body ? req.body : {}),
    api: req.originalUrl,
    message: err.stack,
    status,
  })}`;

const getAddDwsEvQMsg = (data) => {
  const downstreamJobs = data.reduce(
    (acc, val) => [...acc, ...val.downstreamJobs],
    []
  );
  const workspaceTeams = new Map();
  downstreamJobs.reduce(
    (acc, val) => {
      let teams = null;
      val.upstreamJobName = null;
      if (acc.workspaceTeams.has(val.upstreamjobCiWorkspace)) {
        teams = new Set(acc.workspaceTeams.get(val.upstreamjobCiWorkspace));
        teams.add(val.clientName);
        acc.workspaceTeams.set(val.upstreamjobCiWorkspace, Array.from(teams));
      } else {
        acc.workspaceTeams.set(val.upstreamjobCiWorkspace, [val.clientName]);
      }
      return acc;
    },
    { workspaceTeams }
  );

  return { workspaceTeams: Object.fromEntries(workspaceTeams), downstreamJobs };
};

const getWsTeams = (downstreamJobs) => {
  const workspaceTeams = new Map();
  downstreamJobs.reduce(
    (acc, val) => {
      let teams = null;
      val.upstreamJobName = null;
      if (acc.workspaceTeams.has(val.upstreamjobCiWorkspace)) {
        teams = new Set(acc.workspaceTeams.get(val.upstreamjobCiWorkspace));
        teams.add(val.clientName);
        acc.workspaceTeams.set(val.upstreamjobCiWorkspace, Array.from(teams));
      } else {
        acc.workspaceTeams.set(val.upstreamjobCiWorkspace, [val.clientName]);
      }
      return acc;
    },
    { workspaceTeams }
  );
  return workspaceTeams;
};

const getDownstreamJobs = (arg) => {
  const data = { ...{}, ...arg };

  const downstreamJobsList = data.downstreamJobs.reduce((acc, val) => {
    val.upstreamJobName = data.upstreamJobName;
    val.upstreamjobCiWorkspace = data.upstreamjobCiWorkspace;
    acc = [...acc, val];
    return acc;
  }, []);
  return downstreamJobsList;
};

const getAddUpEvQMsg = (data) => {
  let downstreamJobsList = [],
    upstreamJobsList = {},
    interJobsList = [];
  for (let i = 0; i < data.length; i++) {
    upstreamJobsList = {
      ...upstreamJobsList,

      [data[i].upstreamJobName]: {
        jobName: data[i].upstreamJobName,
        upstreamJobName: null,
        upstreamjobCiWorkspace: data[i].upstreamjobCiWorkspace,
        clientName: data[i].clientName,
      },
    };

    if (data[i].hasIntermediate) {
      let interArray = data[i].intermediateJobs;
      for (let j = 0; j < interArray.length; j++) {
        interJobsList = [
          ...interJobsList,
          {
            jobName: interArray[j].upstreamJobName,
            upstreamJobName: data[i].upstreamJobName,
            clientName: data[i].clientName,
            upstreamjobCiWorkspace: data[i].upstreamjobCiWorkspace,
          },
        ];
        interArray[j].upstreamjobCiWorkspace = data[i].upstreamjobCiWorkspace;
        downstreamJobsList = [
          ...downstreamJobsList,
          ...getDownstreamJobs(interArray[j]),
        ];
      }
    } else {
      downstreamJobsList = [
        ...downstreamJobsList,
        ...getDownstreamJobs(data[i]),
      ];
    }
  }

  const workspaceTeams = getWsTeams(downstreamJobsList);

  return {
    workspaceTeams,
    upstreamJobsList: Object.values(upstreamJobsList),
    interJobsList,
    downstreamJobsList,
  };
};

const writeEvent = (event, stream, eventType) => {
  const success = stream.write(eventType.toBuffer(event));
  if (success) {
    console.log(`message queued (${JSON.stringify(event)})`);
  } else {
    console.log("Too many messages in the queue already..");
  }
};

const getJobOwners = (dataset) => {
  const emailList = new Set();
  dataset.reduce((res, val) => {
    let emailCount = [
      ...(val.job_owner
        ? val.job_owner.matchAll(new RegExp("@ge.com", "gi"))
        : []),
    ].map((email) => email.index);
    if (emailCount.length > 1) {
      val.job_owner = val.job_owner.includes(";")
        ? val.job_owner.toLowerCase().replace(";", ",")
        : val.job_owner.toLowerCase();
      val.job_owner.split(",").forEach(function (element) {
        emailList.add(element.trim());
      }, emailList);
    } else {
      if (val.job_owner) emailList.add(val.job_owner.trim().toLowerCase());
    }
    return res;
  }, emailList);
  return Array.from(emailList);
};

const consolidateOwnerNames = (downstreamJobs) => {
  try {
    return Object.keys(downstreamJobs).reduce((acc, key) => {
      if (
        downstreamJobs[key].newOwnerName &&
        downstreamJobs[key].newOwnerName !== ""
      ) {
        acc = {
          ...acc,
          [key]: downstreamJobs[key].newOwnerName,
        };
      }
      return acc;
    }, {});
  } catch (err) {
    console.error("genericUtil(consolidateOwnerNames) : ", err);
    throw err;
  }
};

const getAppBuildConsolidated = (records) => {
  return records.reduce((acc, val) => {
    acc = {
      ...acc,
      [val.apm_version]: {
        ...(acc[val.apm_version] ? acc[val.apm_version] : {}),

        [val.apm_build_number]: {
          ...(acc[val.apm_version] && acc[val.apm_version][val.apm_build_number]
            ? acc[val.apm_version][val.apm_build_number]
            : {}),
          [val.tenant_name]: {
            name: val.tenant_name,
            passed_records: Number(val.passed_records),
            failed_records: Number(val.failed_records),
          },
          data: {
            name:
              acc[val.apm_version] &&
              acc[val.apm_version][val.apm_build_number] &&
              acc[val.apm_version][val.apm_build_number].data.name
                ? acc[val.apm_version][val.apm_build_number].data.name
                : val.apm_build_number,
            passed_records:
              (acc[val.apm_version] &&
              acc[val.apm_version][val.apm_build_number] &&
              acc[val.apm_version][val.apm_build_number].data.passed_records
                ? acc[val.apm_version][val.apm_build_number].data.passed_records
                : 0) + Number(val.passed_records),
            failed_records:
              (acc[val.apm_version] &&
              acc[val.apm_version][val.apm_build_number] &&
              acc[val.apm_version][val.apm_build_number].data.failed_records
                ? acc[val.apm_version][val.apm_build_number].data.failed_records
                : 0) + Number(val.failed_records),
            passed_count:
              (acc[val.apm_version] &&
              acc[val.apm_version][val.apm_build_number] &&
              acc[val.apm_version][val.apm_build_number].data.passed_count
                ? acc[val.apm_version][val.apm_build_number].data.passed_count
                : 0) + 1,
            failed_count:
              (acc[val.apm_version] &&
              acc[val.apm_version][val.apm_build_number] &&
              acc[val.apm_version][val.apm_build_number].data.failed_count
                ? acc[val.apm_version][val.apm_build_number].data.failed_count
                : 0) + 1,
          },
        },

        data: {
          name:
            acc[val.apm_version] && acc[val.apm_version].data.name
              ? acc[val.apm_version].data.name
              : val.apm_version,
          passed_records:
            (acc[val.apm_version] && acc[val.apm_version].data.passed_records
              ? acc[val.apm_version].data.passed_records
              : 0) + Number(val.passed_records),
          failed_records:
            (acc[val.apm_version] && acc[val.apm_version].data.failed_records
              ? acc[val.apm_version].data.failed_records
              : 0) + Number(val.failed_records),
          passed_count:
            (acc[val.apm_version] && acc[val.apm_version].data.passed_count
              ? acc[val.apm_version].data.passed_count
              : 0) + 1,
          failed_count:
            (acc[val.apm_version] && acc[val.apm_version].data.failed_count
              ? acc[val.apm_version].data.failed_count
              : 0) + 1,
        },
      },
    };
    return acc;
  }, {});
};

const getRoundedNumbers = (value) => {
  let upperLimit = Math.ceil(value);
  if (upperLimit - value >= 0.5) {
    return Math.ceil(value);
  } else {
    return Math.floor(value);
  }
};

const decrypt = (salt, encoded) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return encoded
    .match(/.{1,2}/g)
    .map((hex) => parseInt(hex, 16))
    .map(applySaltToChar)
    .map((charCode) => String.fromCharCode(charCode))
    .join("");
};

const getJobActiveStateFromConfig = (parsedXml) =>
  parsedXml["flow-definition"].disabled[0] === "false";

const composeBranchNameFromConfig = (responseBody, parsedXml) => {
  let branchName = null;
  if (responseBody.includes("StringParameterDefinition")) {
    let stringParameters =
      parsedXml["flow-definition"].properties[0][
        "hudson.model.ParametersDefinitionProperty"
      ][0]["parameterDefinitions"][0]["hudson.model.StringParameterDefinition"];

    if (responseBody.includes("gitBranchName")) {
      let indexOfBranch = 0;
      for (let i = 0; i < stringParameters.length; i++) {
        if (stringParameters[i].name[0] === "gitBranchName") {
          indexOfBranch = i;
          break;
        }
      }

      branchName =
        parsedXml["flow-definition"].properties[0][
          "hudson.model.ParametersDefinitionProperty"
        ][0]["parameterDefinitions"][0][
          "hudson.model.StringParameterDefinition"
        ][indexOfBranch]["defaultValue"][0];
    }
  }
  return branchName;
};

const get_branch_name_from_console_text = (text_response_console_text) => {
  try {
    let branch_name = null;
    if (text_response_console_text.includes("Checking out Revision")) {
      let subBranchStr = text_response_console_text.substring(
        text_response_console_text.indexOf("Checking out Revision")
      );
      branch_name = subBranchStr.substring(
        subBranchStr.indexOf("origin/") + "origin/".length,
        subBranchStr.indexOf(")")
      );
    } else {
      console.log(
        `get_branch_name_from_console_text: Branch name not availble in console text`
      );
    }
    return branch_name;
  } catch (err) {
    console.error("jobWorkers(get_branch_name_from_console_text) : ", err);
    throw err;
  }
};

module.exports = {
  buildCiToolsResponse,
  fnDuration,
  freeMemory,
  httpStatus,
  methodName,
  logDate,
  writeToLogs,
  startLogTime,
  handleException,
  getAddDwsEvQMsg,
  writeEvent,
  getAddUpEvQMsg,
  getJobOwners,
  consolidateOwnerNames,
  getAppBuildConsolidated,
  getRoundedNumbers,
  decrypt,
  getJobNameFromBuildUrl,
  getJobActiveStateFromConfig,
  composeBranchNameFromConfig,
  get_branch_name_from_console_text,
};
