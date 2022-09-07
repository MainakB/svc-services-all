const mysql = require("mysql2/promise");
require("dotenv").config();

let dbConfig = {
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
const pool = mysql.createPool(dbConfig);

module.exports = { pool };
