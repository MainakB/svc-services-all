module.exports = {
  PG_SELECT_QUERIES: require("./pgSelectQueries"),
  PG_UPDATE_QUERIES: require("./pgUpdateQueries"),
  PG_DELETE_QUERIES: require("./pgDeleteQueries"),
  PG_INSERT_QUERIES: require("./pgInsertQueries"),
  PG_QUERY_EXECUTORS: require("../pgDbService/dbQueryExecutor"),
};
