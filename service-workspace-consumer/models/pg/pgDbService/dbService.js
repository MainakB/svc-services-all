const format = require("pg-format");
const db = require("../../../utils/dbConnect");
const logger = require("../../../utils/logger");

class PgDBService {
  constructor() {}

  async runQuery(query, values) {
    let result;
    const connection = await db.pool.getConnection();
    const startTime = Date.now();
    let endTime;
    try {
      const queryStr = values ? format(query, values) : format(query);
      logger.debug(`\nRunning Query : ${queryStr}\n\n`, 4, 0);
      result = await connection.query(queryStr);
      endTime = Date.now() - startTime;
      logger.debug(`Ending QUERY.`, 4, endTime);
    } catch (err) {
      endTime = Date.now() - startTime;
      logger.debug(`Error in running the query: ${err.stack}`, 4, endTime);
      throw err;
    } finally {
      endTime = Date.now() - startTime;
      logger.debug(`Releasing database client.\n\n`, 4, endTime);
      if (connection) {
        await connection.release();
        logger.debug(`Succesfuly released database client.\n\n`, 4, endTime);
      }
    }
    return result;
  }

  async runTransaction(querySet) {
    let result = [];
    const connection = await db.pool.getConnection();
    const startTime = Date.now();
    let endTime;
    try {
      await connection.beginTransaction();
      logger.debug(`\nStarting Transaction : BEGIN`, 4, 0);
      for (let i = 0; i < querySet.length; i++) {
        const queryStr = querySet[i].query;
        logger.debug(`Running Query : ${queryStr}\n\n`, 4, 0);
        const op = await connection.query(queryStr);
        result.push(op);
      }
      await connection.commit();
      endTime = Date.now() - startTime;
      logger.debug(`Ending Transaction : COMMIT`, 4, endTime);
    } catch (err) {
      await connection.rollback();
      endTime = Date.now() - startTime;
      logger.debug(
        `Rolling back Transaction with error : ${err.stack}`,
        4,
        endTime
      );
      throw err;
    } finally {
      endTime = Date.now() - startTime;
      logger.debug(`Releasing database client.\n\n`, 4, endTime);
      if (connection) {
        await connection.release();
        logger.debug(`Succesfuly released database client.\n\n`, 4, endTime);
      }
    }
    return result;
  }
}

module.exports = PgDBService;
