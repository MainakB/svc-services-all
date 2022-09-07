const format = require("pg-format");
const { PG_SELECT_QUERIES, PG_INSERT_QUERIES } = require("../queries");
const DbService = require("./dbService");

/**
 * @description: Run a transaction
 */
const runTransaction = async (querySet) => {
  const dbService = new DbService();
  const result_query_run_proc = await dbService.runTransaction(querySet);
  return result_query_run_proc;
};

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

/**
 * @description: Insert data to retry table
 */
const insertToRetryTable = async (
  retryData,
  retry,
  topic,
  errorState,
  schema,
  error
) => {
  const dbService = new DbService();
  const query_to_run = format(
    PG_INSERT_QUERIES.Q_INSERT_RETRY_DATA.DEF_QUERY,
    retryData,
    retry,
    topic,
    errorState,
    schema,
    error
  );
  const result_query_run = await dbService.runQuery(query_to_run);
  return result_query_run;
};

module.exports = {
  runTransaction,
  findCiByName,
  findTeamByName,
  checkIfTenantIsExisting,
  insertCiQuery,
  insertTenantQuery,
  insertTeamsQuery,
  insertToRetryTable,
};
