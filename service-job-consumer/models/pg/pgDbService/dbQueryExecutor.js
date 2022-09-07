const format = require("pg-format");
const {
  PG_SELECT_QUERIES,
  PG_INSERT_QUERIES,
  PG_UPDATE_QUERIES,
  PG_DELETE_QUERIES,
} = require("../queries");
const DbService = require("./dbService");

/**
 * @description: Query to find downstream job
 */
const findJobByName = async (job_name, ci_name, team_name) => {
  const dbService = new DbService();
  const query_run_proc = format(
    PG_SELECT_QUERIES.Q_FETCH_JOB_BY_NAME.DEF_QUERY,
    job_name,
    ci_name,
    team_name
  );
  const result_query_run_proc = await dbService.runQuery(query_run_proc);
  return result_query_run_proc;
};

// /**
//  * @description: Query to find upstream job
//  */
// const findJobInUpstreamByName = async (jobName, workspace, ci, team) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_SELECT_QUERIES.Q_FETCH_UPSTREAM_JOB_BY_NAME.DEF_QUERY,
//     jobName,
//     workspace,
//     ci,
//     team
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Insert missing upstream job from building call
//  */
// const insertUpStreamMissingJob = async (
//   jobName,
//   isPipeline,
//   isIntermediate,
//   upstream_job_for_down,
//   workspace_name,
//   buildable,
//   team,
//   ci,
//   embedUrl
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_INSERT_QUERIES.Q_INSERT_MISSING_UPSTREAM_JOB.DEF_QUERY,
//     jobName,
//     isPipeline,
//     isIntermediate,
//     upstream_job_for_down,
//     workspace_name,
//     buildable,
//     team,
//     ci,
//     embedUrl
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Insert missing downstream job from building call
//  */
const insertMissingJob = async (
  jobName,
  team,
  type,
  branch_name,
  ci,
  job_owner,
  embedUrl
) => {
  const dbService = new DbService();
  const query_run_proc = format(
    PG_INSERT_QUERIES.Q_INSERT_MISSING_JOB.DEF_QUERY,
    jobName,
    team,
    type,
    branch_name,
    ci,
    job_owner,
    embedUrl
  );
  const result_query_run_proc = await dbService.runQuery(query_run_proc);
  return result_query_run_proc;
};

// /**
//  * @description: Insert Insert to downstream build history
//  */
// const insertDownstreamBuildHistoryFromBuilding = async (
//   build_result,
//   build_duration,
//   build_number,
//   downstream_job_id,
//   build_url,
//   build_timestamp,
//   upstream_build_number,
//   tenant_name,
//   client_name,
//   branch_name,
//   workspace_name,
//   ci_type
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_INSERT_QUERIES.Q_INSERT_DOWNSTREAM_BUILD_HISTORY_BUILDING.DEF_QUERY,
//     build_result,
//     build_duration,
//     build_number,
//     downstream_job_id,
//     build_url,
//     build_timestamp,
//     upstream_build_number,
//     tenant_name,
//     client_name,
//     branch_name,
//     workspace_name,
//     ci_type
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Insert Insert to upstream build history
//  */

// const insertUpstreamBuildHistoryFromBuilding = async (
//   build_result,
//   build_duration,
//   build_number,
//   downstream_job_id,
//   build_url,
//   build_timestamp,
//   upstream_build_number,
//   tenant_name,
//   client_name,
//   workspace_name,
//   ci_type
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_INSERT_QUERIES.Q_INSERT_UPSTREAM_BUILD_HISTORY_BUILDING.DEF_QUERY,
//     build_result,
//     build_duration,
//     build_number,
//     downstream_job_id,
//     build_url,
//     build_timestamp,
//     upstream_build_number,
//     tenant_name,
//     client_name,
//     workspace_name,
//     ci_type
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

const updateJobDetails = async (
  branch_name,
  job_owner,
  job_name,
  ci_name,
  team_name,
  job_type
) => {
  const dbService = new DbService();
  const query_run_proc = format(
    PG_UPDATE_QUERIES.Q_UPDATE_JOB_ON_COPMPLETE.DEF_QUERY,
    branch_name,
    job_owner,
    team_name,
    job_type,
    job_name,
    ci_name
  );

  const result_query_run_proc = await dbService.runQuery(query_run_proc);
  return result_query_run_proc;
};

// const updateUpstreamInterRef = async (
//   upstream_ref_to_intermediate,
//   upstream_is_intermediate,
//   downstream_job_name,
//   ci_workspace_id,
//   ci_name,
//   client_name
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_UPDATE_QUERIES.Q_UPDATE_UPSTREAM_REF_OF_INTERMEDIATE.DEF_QUERY,
//     upstream_ref_to_intermediate,
//     upstream_is_intermediate,
//     client_name,
//     ci_workspace_id,
//     downstream_job_name,
//     ci_name
//   );

//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Insert Insert to upstream build history to complete
//  */
// const insertUpstreamBuildHistoryFromComplete = (
//   build_result,
//   build_duration,
//   build_number,
//   upstream_job_id,
//   build_url,
//   build_timestamp,
//   upstream_build_number,
//   tenant_name,
//   client_name,
//   workspace_name,
//   ci_type,
//   build_stages
// ) => {
//   const query_run_proc = format(
//     PG_INSERT_QUERIES.Q_INSERT_UPSTREAM_BUILD_HISTORY_COMPLETE.DEF_QUERY,
//     build_result,
//     build_duration,
//     build_number,
//     upstream_job_id,
//     build_url,
//     build_timestamp,
//     upstream_build_number,
//     tenant_name,
//     client_name,
//     workspace_name,
//     ci_type,
//     build_stages
//   );

//   return query_run_proc;
// };

/**
 * @description: Update job health url downstream
 */
const updateJobHealthUrl = (
  jobName,
  url,
  description,
  result,
  timestamp,
  lastBuildUrl,
  tenant_name,
  team,
  embeddable_url
) => {
  const query_run_proc = format(
    PG_UPDATE_QUERIES.Q_UPDATE_HEALTH_REPORT_PNG_LAST_BUILD.DEF_QUERY,
    url,
    description,
    result,
    timestamp,
    lastBuildUrl,
    tenant_name,
    embeddable_url,
    jobName,
    team
  );
  return query_run_proc;
};

// /**
//  * @description: Update job health url upstream
//  */
// const updateJobHealthUrlUpstream = (
//   jobName,
//   url,
//   description,
//   result,
//   timestamp,
//   lastBuildUrl,
//   tenant_name,
//   workpace,
//   team,
//   embeddable_url
// ) => {
//   const query_run_proc = format(
//     PG_UPDATE_QUERIES.Q_UPDATE_HEALTH_REPORT_PNG_LAST_BUILD_UPSTREAM.DEF_QUERY,
//     url,
//     description,
//     result,
//     timestamp,
//     lastBuildUrl,
//     tenant_name,
//     embeddable_url,
//     jobName,
//     workpace,
//     team
//   );

//   return query_run_proc;
// };

/**
 * @description: Run a transaction to update up/down history table and down/upstream job table
 */
const populateHistorTableAndUpdate = async (
  updateHealthQuery,
  markCompleteQuery
) => {
  const dbService = new DbService();
  const querySet = [{ query: updateHealthQuery }, { query: markCompleteQuery }];

  const result_query_run_proc = await dbService.runTransaction(querySet);
  return result_query_run_proc;
};

// /**
//  * @description: Update a build from build history
//  */
// const upadateDanglingBuild = async (
//   api_url,
//   workspace_name,
//   team,
//   isUpstream
// ) => {
//   const dbService = new DbService();
//   const query =
//     isUpstream === "upstream"
//       ? PG_UPDATE_QUERIES.Q_UPDATE_BUILD_HISTORY_JOB_UPSTREAM_DANDLING_PROGRESS
//           .DEF_QUERY
//       : PG_UPDATE_QUERIES
//           .Q_UPDATE_BUILD_HISTORY_JOB_DOWNSTREAM_DANDLING_PROGRESS.DEF_QUERY;

//   const query_run_proc = format(query, api_url, workspace_name, team);
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Get timestamp of build in progress
//  */
// const checkIfBuildIsStale = async (
//   api_url,
//   workspace_name,
//   team,
//   isUpstream
// ) => {
//   const dbService = new DbService();
//   const query =
//     isUpstream === "upstream"
//       ? PG_SELECT_QUERIES.Q_FETCH_BUILD_TIMESTAMP_UPSTREAM.DEF_QUERY
//       : PG_SELECT_QUERIES.Q_FETCH_BUILD_TIMESTAMP_DOWNSTREAM.DEF_QUERY;

//   const query_run_proc = format(query, api_url, workspace_name, team);
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Delete a stale build
//  */
// const deleteStuckStaleBuild = async (id, isUpstream) => {
//   const dbService = new DbService();
//   const query =
//     isUpstream === "upstream"
//       ? PG_DELETE_QUERIES.Q_DELETE_UPSTREAM_STALE_BUILD.DEF_QUERY
//       : PG_DELETE_QUERIES.Q_DELETE_DOWNSTREAM_STALE_BUILD.DEF_QUERY;

//   const query_run_proc = format(query, id);
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

/**
 * @description: Insert Insert to downstream build history to complete
 */
const insertJobBuildHistoryFromComplete = (
  build_result,
  build_duration,
  build_number,
  job_id,
  build_url,
  build_timestamp,
  tenant_name,
  branch_name,
  app_build_number,
  app_version,
  browser_name,
  build_stages
) => {
  const query_run_proc = format(
    PG_INSERT_QUERIES.Q_INSERT_JOB_BUILD_HISTORY_COMPLETE.DEF_QUERY,
    build_result,
    build_duration,
    build_number,
    job_id,
    build_url,
    build_timestamp,
    tenant_name,
    branch_name,
    app_build_number,
    app_version,
    browser_name,
    build_stages
  );
  return query_run_proc;
};

// /**
//  * @description: Fetch downstream job by queueid and buidl url with queueid
//  */
// const fetchDownstreamJobHistByQueueIdDetails = async (
//   downstream_job_name,
//   build_url,
//   build_number,
//   ci_workspace_id,
//   ci_name,
//   client_name
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_SELECT_QUERIES.Q_FETCH_DOWNSTREAM_JOB_HISTORY_BY_QUEUEID_DETAILS
//       .DEF_QUERY,
//     downstream_job_name,
//     build_url,
//     build_number,
//     ci_workspace_id,
//     ci_name,
//     client_name
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Fetch upstream job by queueid and buidl url with queueid
//  */
// const fetchUpstreamJobHistByQueueIdDetails = async (
//   upstream_job_name,
//   build_url,
//   build_number,
//   ci_workspace_id,
//   ci_name,
//   client_name
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_SELECT_QUERIES.Q_FETCH_DOWNSTREAM_JOB_HISTORY_BY_QUEUEID_DETAILS
//       .DEF_QUERY,
//     upstream_job_name,
//     build_url,
//     build_number,
//     ci_workspace_id,
//     ci_name,
//     client_name
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Update downstream build history from queue
//  */
// const updateDownstreamBuildHistoryFromBuildingAndInQueue = async (
//   build_result,
//   build_duration,
//   build_number,
//   build_url,
//   build_timestamp,
//   upstream_build_number,
//   tenant_name,
//   branch_name,
//   downstream_job_id,
//   queue_id,
//   queue_url,
//   workspace_name,
//   ci_type,
//   client_name
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_UPDATE_QUERIES.Q_UPDATE_DOWNSTREAM_IN_QUEUE_TO_BUILDING.DEF_QUERY,
//     build_result,
//     build_duration,
//     build_number,
//     build_url,
//     build_timestamp,
//     upstream_build_number,
//     tenant_name,
//     branch_name,
//     downstream_job_id,
//     queue_id,
//     queue_url,
//     workspace_name,
//     ci_type,
//     client_name
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Update upstream build history from queue
//  */
// const updateUpstreamBuildHistoryFromBuildingAndInQueue = async (
//   build_result,
//   build_duration,
//   build_number,
//   build_url,
//   build_timestamp,
//   upstream_build_number,
//   tenant_name,
//   upstream_job_id,
//   queue_id,
//   buildUrlWithQueueId,
//   ci_workspace_id,
//   client_name,
//   ci
// ) => {
//   const dbService = new DbService();
//   const query_run_proc = format(
//     PG_UPDATE_QUERIES.Q_UPDATE_UPSTREAM_IN_QUEUE_TO_BUILDING.DEF_QUERY,
//     build_result,
//     build_duration,
//     build_number,
//     build_url,
//     build_timestamp,
//     upstream_build_number,
//     tenant_name,
//     upstream_job_id,
//     queue_id,
//     buildUrlWithQueueId,
//     ci_workspace_id,
//     ci,
//     client_name
//   );
//   const result_query_run_proc = await dbService.runQuery(query_run_proc);
//   return result_query_run_proc;
// };

// /**
//  * @description: Fetch SSO token for a user in a workspace
//  */
// const fetchSsoToken = async (workspace, sso) => {
//   const dbService = new DbService();

//   const query_to_run = format(
//     PG_SELECT_QUERIES.Q_FETCH_USER_TOKEN.DEF_QUERY,
//     workspace,
//     sso
//   );
//   const result_query_run = await dbService.runQuery(query_to_run);
//   return result_query_run;
// };

/**
 * @description: Check if ci exist
 */
const findCiByName = async (ci_name) => {
  const dbService = new DbService();

  const query_to_run = format(
    PG_SELECT_QUERIES.Q_FETCH_CI_BY_NAME.DEF_QUERY,
    ci_name
  );
  const result_query_run = await dbService.runQuery(query_to_run);
  return result_query_run;
};

/**
 * @description: Check if team exist
 */
const findTeamByName = async (ci_team_name) => {
  const dbService = new DbService();

  const query_to_run = format(
    PG_SELECT_QUERIES.Q_FETCH_TEAM_BY_NAME.DEF_QUERY,
    ci_team_name
  );
  const result_query_run = await dbService.runQuery(query_to_run);
  return result_query_run;
};

/**
 * @description: Insert data to retry table
 */
const checkIfTenantIsExisting = async (tenant_name) => {
  const dbService = new DbService();

  const query_to_run = format(
    PG_SELECT_QUERIES.Q_FETCH_TENANT_BY_NAME.DEF_QUERY,
    tenant_name
  );
  const result_query_run = await dbService.runQuery(query_to_run);
  return result_query_run;
};



/**
 * @description: Return query to insert ci tool name
 */
const fetchBuildAvgs = async (tenant) => {
  const dbService = new DbService();

  const query_to_run = format(
    PG_SELECT_QUERIES.Q_FETCH_BUILD_AVERAGES.DEF_QUERY,
    tenant
  );
  const result_query_run = await dbService.runQuery(query_to_run);
  return result_query_run;
};

/**
 * @description: Return query to insert ci tool name
 */
 const insertCiQuery = (ci_values) => {
  return format(PG_INSERT_QUERIES.Q_INSERT_CI.DEF_QUERY, ci_values);
};

/**
 * @description: Return query to insert tenant name
 */
const insertTenantQuery = (tn_values) => {
  return format(PG_INSERT_QUERIES.Q_INSERT_TENANT.DEF_QUERY, tn_values);
};

/**
 * @description: Return query to insert team name
 */
const insertTeamsQuery = (teams_values) => {
  return format(PG_INSERT_QUERIES.Q_INSERT_TEAMS.DEF_QUERY, teams_values);
};

// /**
//  * @description: Run a transaction to update ci, workspace and teams table
//  */
const populateTeamCiTenant = async (querySet) => {
  const dbService = new DbService();
  const result_query_run_proc = await dbService.runTransaction(querySet);
  return result_query_run_proc;
};

module.exports = {
  // findJobInDownstreamByName,
  // findJobInUpstreamByName,
  // insertUpStreamMissingJob,
  // insertDownStreamMissingJob,
  // insertDownstreamBuildHistoryFromBuilding,
  // insertUpstreamBuildHistoryFromBuilding,
  // updateDownstreamInterRef,
  // updateUpstreamInterRef,
  // insertDownstreamBuildHistoryFromComplete,
  // insertUpstreamBuildHistoryFromComplete,
  // updateJobHealthUrlUpstream,
  // updateJobHealthUrlDownstream,
  // populateHistorTableAndUpdate,
  // fetchDownstreamJobHistByQueueIdDetails,
  // fetchUpstreamJobHistByQueueIdDetails,
  // updateDownstreamBuildHistoryFromBuildingAndInQueue,
  // updateUpstreamBuildHistoryFromBuildingAndInQueue,
  // upadateDanglingBuild,
  // checkIfBuildIsStale,
  // deleteStuckStaleBuild,
  // fetchSsoToken,
  findJobByName,
  insertCiQuery,
  insertTenantQuery,
  insertTeamsQuery,
  findCiByName,
  findTeamByName,
  checkIfTenantIsExisting,
  populateTeamCiTenant,
  insertMissingJob,
  updateJobDetails,
  updateJobHealthUrl,
  insertJobBuildHistoryFromComplete,
  populateHistorTableAndUpdate,
  fetchBuildAvgs,
};
