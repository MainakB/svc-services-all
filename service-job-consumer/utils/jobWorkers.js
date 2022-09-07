const xml2js = require("xml2js");
const sleep = require("util").promisify(setTimeout);
const Kafka = require("node-rdkafka");
const fetch = require("node-fetch");

const logger = require("./logger");
const genericUtils = require("./genericUtils");
const { PG_QUERY_EXECUTORS } = require("../models/pg/pgDbService");

const getConsumer = (groupdata) => {
  const consumer = new Kafka.KafkaConsumer(
    {
      "group.id": groupdata.groupname,
      "metadata.broker.list":
        process.env["NODE_ENV"] === "production"
          ? process.env.KAFKA_BROKERS
          : process.env.KAFKA_BROKERS_DEV,
      "security.protocol": "PLAINTEXT",
      "enable.auto.commit": false,
      offset_commit_cb: function (err, topicPartitions) {
        if (err) {
          console.error(`There was an error committing: ${err}`);
        } else {
          // Commit went through. Let's log the topic partitions
          console.log(`Commit successful: ${topicPartitions}`);
        }
      },
    },
    {
      "auto.offset.reset": "earliest", //Read from last offset
    }
  );
  connect(consumer, groupdata);
  return consumer;
};

const connect = (consumer, groupdata) =>
  consumer.connect({ timeout: "1000ms" }, (err) => {
    if (err) {
      console.log(
        `Error connecting to Kafka broker for topic ${groupdata.topicname}: ${err}`
      );
      process.exit(-1);
    }
    console.log(
      `Consumer connected to Kafka broker for topic ${groupdata.topicname}`
    );
  });

const handleFetch = async (api_url, options = {}, retry = 3) => {
  const startTime = Date.now();
  logger.debug(`Calling Url: ${api_url}`, 4, 0);
  try {
    const response = await fetch(api_url, options);
    const endTime = Date.now() - startTime;
    logger.debug(
      `Response status received for Url ${api_url} in handle fetch is ${response.status} and response is ${response}`,
      4,
      endTime
    );
    if (response.status >= 400) {
      throw Error(response.statusText);
    }
    logger.debug(`Response received for Url: ${api_url}`, 4, endTime);
    return response;
  } catch (err) {
    logger.debug(
      `jobworkers(handleFetch) : Fetch failed. Retyry count: ${retry}. Error is: ${err.message}`,
      4,
      0
    );

    if (retry > 0) {
      logger.debug(
        `jobworkers(handleFetch) : Retrying fetch ${retry} time because of error ${err.message}`,
        4,
        0
      );
      await sleep(Math.floor(Math.random() * (25000 - 5000 + 1)) + 5000);
      const responseFromFetch = await handleFetch(api_url, options, retry - 1);
      logger.debug(`jobworkers(handleFetch) : Response received`, 4, 0);
      return responseFromFetch;
    } else {
      logger.debug(
        `jobworkers(handleFetch) : Retry count : ${retry}.Fetch failed because of error ${err.stack}`,
        4,
        0
      );
      throw err;
    }
  }
};

const fetch_console_text = async (url, ssoToken) => {
  try {
    const api_url = url.endsWith("/consoleText")
      ? url
      : `${url.replace("http://", "")}consoleText`;
    const fetch_response_console_text = await handleFetch(
      `http://${process.env.USER_ID}:${ssoToken}@${api_url}`
    );
    return fetch_response_console_text.text();
  } catch (err) {
    logger.debug(`jobWorkers(fetch_console_text): Error  ${err.stack}`, 4, 0);
    throw err;
  }
};

const checkIfBuildExist = async (job, ssoToken) => {
  try {
    const api_url = `http://${process.env.USER_ID}:${ssoToken}@${job.replace(
      "http://",
      ""
    )}api/json?tree=url`;

    const response = await handleFetch(api_url, {}, 0);
    console.log(
      `jobworkers(checkIfBuildExist) : Check if build exist -> ${{
        job,
        status: response.statusText,
      }}`
    );
    return response.statusText.toLowerCase() === "ok";
  } catch (err) {
    console.error("jobWorkers(checkIfBuildExist) : ", err);
    throw err;
  }
};

const getJobMetadataInBuilding = async (api_url, ssoToken) => {
  try {
    const fetch_response_queue_item = await handleFetch(
      `http://${process.env.USER_ID}:${ssoToken}@${api_url.replace(
        "http://",
        ""
      )}api/json?tree=url,id,duration,timestamp,queueId,result,actions[causes[*],parameters[*]]&depth=1`
    );
    const json_response = await fetch_response_queue_item.json();
    logger.debug(
      `jobworkers(getJobMetadataInBuilding) : Received json metadata for job in building state - ${json_response}`,
      4,
      0
    );
    return json_response;
  } catch (err) {
    logger.debug(
      `jobworkers(getJobMetadataInBuilding) : Failed due to error ${err.stack} with a response ${fetch_response_queue_item}`,
      4,
      0
    );
    throw err;
  }
};

const getParsedxml = async (responseBody) =>
  xml2js.parseStringPromise(responseBody);

const getXmlFromConfig = async (jobName, ssoToken) => {
  try {
    const api_url = `http://${
      process.env.USER_ID
    }:${ssoToken}@${jobName.replace("http://", "")}config.xml`;
    const response = await handleFetch(api_url);
    const responseBody = await response.text();
    return responseBody;
  } catch (err) {
    logger.debug(
      `jobworkers(getXmlFromConfig) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getJobOwnerFromConfigHistory = async (job, ssoToken) => {
  try {
    const api_url = `http://${process.env.USER_ID}:${ssoToken}@${job.replace(
      "http://",
      ""
    )}jobConfigHistory/api/json`;
    const response = await handleFetch(api_url);
    const responseBody = await response.json();
    if (
      responseBody.jobConfigHistory.length &&
      responseBody.jobConfigHistory[0].user
    ) {
      return responseBody.jobConfigHistory[0].user;
    } else {
      return null;
    }
  } catch (err) {
    logger.debug(
      `jobworkers(getJobOwnerFromConfigHistory) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getDownstreamJobOwner = async (
  ssoToken,
  responseBody,
  parsedXml,
  job
) => {
  try {
    let indexOfOwner = -1;
    if (responseBody.includes("StringParameterDefinition")) {
      let stringParameters =
        parsedXml["flow-definition"].properties[0][
          "hudson.model.ParametersDefinitionProperty"
        ][0]["parameterDefinitions"][0][
          "hudson.model.StringParameterDefinition"
        ];

      if (responseBody.includes("emailOnFailure")) {
        for (let i = 0; i < stringParameters.length; i++) {
          if (stringParameters[i].name[0] === "emailOnFailure") {
            if (
              stringParameters[i].defaultValue[0] &&
              stringParameters[i].defaultValue[0] !== ""
            ) {
              indexOfOwner = i;
            }
            break;
          }
        }
      }

      if (indexOfOwner < 0) {
        if (responseBody.includes("emailOnSuccess")) {
          for (let i = 0; i < stringParameters.length; i++) {
            if (stringParameters[i].name[0] === "emailOnSuccess") {
              if (
                stringParameters[i].defaultValue[0] &&
                stringParameters[i].defaultValue[0] !== ""
              ) {
                indexOfOwner = i;
              }
              break;
            }
          }
        }
      }
    }
    if (indexOfOwner < 0) {
      jobOwner = await getJobOwnerFromConfigHistory(job, ssoToken);
    } else {
      jobOwner =
        parsedXml["flow-definition"].properties[0][
          "hudson.model.ParametersDefinitionProperty"
        ][0]["parameterDefinitions"][0][
          "hudson.model.StringParameterDefinition"
        ][indexOfOwner]["defaultValue"][0];
      if (!jobOwner.includes("@ge.com")) {
        jobOwner = await getJobOwnerFromConfigHistory(job, ssoToken);
      }
    }
    return jobOwner;
  } catch (err) {
    logger.debug(
      `jobworkers(getDownstreamJobOwner) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getBranchNameFromGetBuildDataApi = async (
  url,
  ssoToken,
  retryCount = 1
) => {
  let gitEndPoint = retryCount <= 1 ? "git" : `git-${retryCount}`;
  try {
    const api_url = `http://${process.env.USER_ID}:${ssoToken}@${url.replace(
      "http://",
      ""
    )}${gitEndPoint}/api/json?tree=buildsByBranchName`;
    const response = await handleFetch(api_url);
    const responseBody = await response.json();
    const branchString = Object.keys(responseBody.buildsByBranchName);
    const branch_name = branchString[0].substring(
      branchString[0].indexOf("origin/") + "origin/".length
    );
    return branch_name;
  } catch (err) {
    logger.debug(
      `jobworkers(getBranchNameFromGetBuildDataApi) : Failed due to error ${err.message}`,
      4,
      0
    );
    if (retryCount < 4) {
      return getBranchNameFromGetBuildDataApi(url, ssoToken, retryCount + 1);
    } else {
      return null;
    }
  }
};

const getBranchNameFromConfig = async (
  configXml,
  parsedConfigXml,
  jobName,
  ssoToken
) => {
  const configXmlDerived =
    configXml || (await getXmlFromConfig(jobName, ssoToken));
  const parsedConfigXmlDerived = configXml
    ? parsedConfigXml
    : await getParsedxml(configXmlDerived);
  branch_name = genericUtils.composeBranchNameFromConfig(
    configXmlDerived,
    parsedConfigXmlDerived
  );
  return branch_name;
};

const getBranchName = async (
  ssoToken,
  branchValue,
  api_url,
  jobName,
  text_response_console_text,
  configXml,
  parsedConfigXml,
  fromConfigFirst
) => {
  if (branchValue) return branchValue;

  let branch_name = null;
  if (fromConfigFirst) {
    branch_name = await getBranchNameFromConfig(
      configXml,
      parsedConfigXml,
      jobName,
      ssoToken
    );
  } else {
    branch_name = await getBranchNameFromGetBuildDataApi(api_url, ssoToken);
  }

  if (branch_name === "" || !branch_name) {
    branch_name = genericUtils.get_branch_name_from_console_text(
      text_response_console_text
    );
  }
  if (!fromConfigFirst && (branch_name === "" || !branch_name)) {
    branch_name = await getBranchNameFromConfig(
      configXml,
      parsedConfigXml,
      jobName,
      ssoToken
    );
  }

  return branch_name;
};

const getTableUpdateDataForInBuilding = async (
  ssoToken,
  branch_value,
  jobName,
  api_url,
  text_response_console_text,
  fromConfigFirst
) => {
  try {
    const configXml = await getXmlFromConfig(jobName, ssoToken);
    const parsedConfigXml = await getParsedxml(configXml);

    let branch_name = await getBranchName(
      ssoToken,
      branch_value,
      api_url,
      jobName,
      text_response_console_text,
      configXml,
      parsedConfigXml,
      fromConfigFirst
    );

    // const buildable = genericUtils.getJobActiveStateFromConfig(parsedConfigXml);

    return {
      branch_name,
      configXml,
      parsedConfigXml,
    };
  } catch (err) {
    logger.debug(
      `jobworkers(getTableUpdateDataForInBuilding) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const addJobIfMissingElseUpdate = async (reqPayload) => {
  try {
    const { api_url, tenant_name, team, type } = reqPayload;

    const ssoToken = await getSsoToken();

    // Get job url from build url
    const jobName = genericUtils.getJobNameFromBuildUrl(api_url);

    const build_present = await checkIfBuildExist(api_url, ssoToken);

    if (!build_present) {
      // await updateStuckBuildToAbort({ api_url, workspace_name, team }, null);
      return false;
    }

    const requests = [
      getJobMetadataInBuilding(api_url, ssoToken),
      fetch_console_text(api_url, ssoToken),
    ];

    const [json_response, text_response_console_text] = await Promise.all(
      requests
    );

    const ci = "Jenkins";
    // genericUtils.deriveCiName(api_url);
    // type = genericUtils.getType(json_response, type);

    // const [branch_value, downstreamJob] = await Promise.all(localRequest);
    const downstreamJob = await PG_QUERY_EXECUTORS.findJobByName(
      jobName,
      ci,
      team
    );

    const { branch_name, configXml, parsedConfigXml } =
      await getTableUpdateDataForInBuilding(
        ssoToken,
        null,
        jobName,
        api_url,
        text_response_console_text,
        true
      );

    const job_owner = await getDownstreamJobOwner(
      ssoToken,
      configXml,
      parsedConfigXml,
      jobName
    );

    let job_insert = null;

    if (!downstreamJob[0].length) {
      const embedUrl = await getBadgeLink(ssoToken, jobName);
      job_insert = await PG_QUERY_EXECUTORS.insertMissingJob(
        jobName,
        team,
        type,
        branch_name,
        ci,
        job_owner,
        embedUrl
      );
    } else {
      job_insert = await PG_QUERY_EXECUTORS.updateJobDetails(
        branch_name,
        job_owner,
        jobName,
        ci,
        team,
        type
      );
    }

    return job_insert.insertId;
  } catch (err) {
    logger.debug(
      `jobworkers(addJobIfMissingElseUpdateInter) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getBuildStages = async (api_url, ssoToken, retry = 1) => {
  try {
    let stagesResult = "IN_PROGRESS";
    let stages_response_query_result = null;
    while (stagesResult === "IN_PROGRESS") {
      stages_response_query_result = await (
        await handleFetch(
          `http://${process.env.USER_ID}:${ssoToken}@${api_url.replace(
            "http://",
            ""
          )}wfapi/describe`
        )
      ).json();
      await sleep(3000);
      stagesResult =
        stages_response_query_result && stages_response_query_result.status
          ? stages_response_query_result.status
          : stagesResult;
    }
    return stages_response_query_result;
  } catch (err) {
    logger.debug(
      `jobworkers(getBuildStages) : Failed due to error ${err.stack}`,
      4,
      0
    );
    if (retry > 0) {
      await sleep(3000);
      return getBuildStages(api_url, ssoToken, retry - 1);
    } else {
      throw err;
    }
  }
};

const fetch_weather_report = async (getHealth) => {
  try {
    const ciUrlPng = `http://ci.jenkins.io/images/32x32/${getHealth.healthReport[0].iconUrl}`;
    const { description } = getHealth.healthReport[0];
    return { ciUrlPng, description };
  } catch (err) {
    logger.debug(
      `jobworkers(fetch_weather_report) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getHealth = async (jobName, ssoToken) =>
  await (
    await handleFetch(
      `http://${process.env.USER_ID}:${ssoToken}@${jobName.replace(
        "http://",
        ""
      )}api/json?tree=healthReport[iconUrl,description],lastBuild[url]`
    )
  ).json();

const getJobMetadataOnComplete = async (api_url, ssoToken) => {
  try {
    const url = `http://${process.env.USER_ID}:${ssoToken}@${api_url.replace(
      "http://",
      ""
    )}api/json?tree=url,id,duration,timestamp,queueId,description,result,building,actions[causes[*],parameters[*]]&depth=1`;
    let json_response = null;
    let status = null;
    let isBuilding = false;

    const startTime = new Date().getTime();
    let duration = 0;
    let endTime = 0;
    while (
      (status === null || status === undefined || duration === 0) &&
      parseInt(endTime / 60000) < 3
    ) {
      let fetch_response_queue_item = await handleFetch(url);
      json_response = await fetch_response_queue_item.json();
      status = json_response.result;
      isBuilding = json_response.building;
      duration = json_response.duration;
      if (status === null || status === undefined) {
        await sleep(3000);
      }
      endTime = new Date().getTime() - startTime;
      console.log("Elapsed time", parseInt(endTime / 60000));
    }
    console.log("getJobMetadataOnComplete: Exited while loop: ", {
      status,
      endTime: parseInt(endTime / 60000),
      json_response,
    });

    return json_response;
  } catch (err) {
    logger.debug(
      `jobworkers(getJobMetadataInBuilding) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getSsoToken = async () => {
  return process.env.CONATBOJENKINSTOKEN;
  // let ssoTokenResult = await fetchSssoTokenRemote(workspace_name);
  // if (!ssoTokenResult) {
  //   ssoTokenResult = await fetchSssoTokenRest(workspace_name);
  // }
  // if (!ssoTokenResult)
  //   throw Error("jobworkers(getSsoToken): Error fetching sso token");
  // const ssoToken = genericUtils.decrypt(
  //   process.env.USER_ID + workspace_name,
  //   ssoTokenResult
  // );
  // return ssoToken;
};

const updateBuildHistoryFromComplete = async (reqPayload) => {
  try {
    const { api_url, tenant_name, app_version, browser_name, team, type } =
      reqPayload;

    const ssoToken = await getSsoToken();

    // Get job url from build url
    const jobName = genericUtils.getJobNameFromBuildUrl(api_url);
    const requests = [
      getJobMetadataOnComplete(api_url, ssoToken),
      fetch_console_text(api_url, ssoToken),
    ];

    const [json_response, text_response_console_text] = await Promise.all(
      requests
    );

    console.log(
      "updateBuildHistoryFromComplete: Status of building ",
      JSON.stringify(json_response),
      json_response.building,
      "response status: ",
      json_response.result
    );

    if (json_response.building && !json_response.result) return false;

    const tenant_value = tenant_name;
    const ci = "Jenkins";
    // genericUtils.deriveCiName(api_url);

    const healthMetadata = await getHealth(jobName, ssoToken);
    logger.debug(
      `jobworkers(updateBuildHistoryFromBuilding) : Retrieved health metadata is ${
        healthMetadata ? JSON.stringify(healthMetadata) : healthMetadata
      }`
    );
    const { ciUrlPng, description } = await fetch_weather_report(
      healthMetadata
    );

    const branch_name = await getBranchName(
      ssoToken,
      null,
      api_url,
      jobName,
      text_response_console_text,
      null,
      null,
      false
    );

    const build_stages = await getBuildStages(api_url, ssoToken);
    const embeddable_url = await getBadgeLink(ssoToken, jobName);
    const updateHealthQuery = PG_QUERY_EXECUTORS.updateJobHealthUrl(
      jobName,
      ciUrlPng,
      description,
      json_response.result,
      json_response.timestamp,
      healthMetadata.lastBuild.url,
      tenant_value,
      team,
      embeddable_url
    );

    console.log("build_stages", build_stages);
    const markCompleteQueryQuery =
      PG_QUERY_EXECUTORS.insertJobBuildHistoryFromComplete(
        json_response.result,
        json_response.duration,
        json_response.id,
        jobName,
        api_url,
        json_response.timestamp,
        tenant_value,
        branch_name,
        app_version,
        app_version,
        browser_name || null,
        // build_stages
        null
      );

    await PG_QUERY_EXECUTORS.populateHistorTableAndUpdate(
      updateHealthQuery,
      markCompleteQueryQuery
    );

    return true;
  } catch (err) {
    logger.debug(
      `jobworkers(updateBuildHistoryFromBuilding) : Failed due to error ${err.stack}`,
      4,
      0
    );
    throw err;
  }
};

const getBadgeLink = async (ssoToken, job) => {
  try {
    const api_url = `http://${process.env.USER_ID}:${ssoToken}@${job.replace(
      "http://",
      ""
    )}badge/`;
    const response = await handleFetch(api_url);
    if (!response.ok) throw Error(response.statusText);
    const responseBody = await response.text();
    logger.debug(`jobWorkers(getBadgeLink) : Retrieved responseBody`);
    let links = responseBody.substring(responseBody.indexOf("<h2>Links</h2>"));
    let unprotected = links.substring(
      links.indexOf('<b>unprotected</b><input type="text" value=') +
        '<b>unprotected</b><input type="text" value='.length
    );
    let badgeLink = unprotected.substring(0, unprotected.indexOf("class="));
    const regex = /"/g;
    badgeLink = badgeLink.replace(regex, "").trim();

    if (!badgeLink.endsWith("/")) {
      badgeLink = badgeLink + `/&t=${Date.now()}`;
    }
    logger.debug(
      `jobWorkers(getBadgeLink) : Retrieved badge link is : ${badgeLink}`
    );
    return badgeLink;
  } catch (err) {
    console.error("jobWorkers(getBadgeLink) : ", err);
    throw err;
  }
};

module.exports = {
  addJobIfMissingElseUpdate,
  updateBuildHistoryFromComplete,
  getConsumer,
  connect,
};
