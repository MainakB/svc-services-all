var mysql = require("mysql2");
const util = require("util");

// var connectionPool = mysql.createPool(config);
// console.log("Poool", connectionPool);
// module.exports = connectionPool;

const makeDb = async () => {
  let config = {
    connectionLimit: 10,
    host:
      process.env["NODE_ENV"] === "development"
        ? process.env.MYSQLHOST_DEV || "mysql"
        : process.env.MYSQLHOST_PROD,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    connectTimeout: 10000,
    connectionLimit: 10,
    charset: process.env.CLIENTENCODING,
  };

  const connection = mysql.createPool(config);

  connection.on("release", function (connection) {
    console.log("Connection %d released", connection.threadId);
  });

  return {
    query(sql, args) {
      return util.promisify(connection.query).call(connection, sql, args);
    },
    beginTransaction() {
      console.log("11111111");
      return util.promisify(connection.beginTransaction).call(connection);
    },
    commit() {
      return util.promisify(connection.commit).call(connection);
    },
    rollback() {
      console.log("33333");
      return util.promisify(connection.rollback).call(connection);
    },
    close() {
      return util.promisify(connection.end).call(connection);
    },
  };
};

module.exports = makeDb;
