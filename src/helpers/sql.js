const postgres = require("postgres");
require("dotenv").config();

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const sql = postgres({
  host: 'postgres-db',
  database: 'counselling_db',
  username: 'admin',
  password: 'admin',
  port: 5432,
  // ssl: "require",
  // connection: {
  //   options: `project=${ENDPOINT_ID}`,
  // },
});

module.exports = sql;
