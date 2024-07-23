require('dotenv').config();
const postgres = require("postgres");
const clc = require("cli-color");

async function initializeConnection() {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

  const sql = postgres({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    // ssl: "require",
    // connection: {
    //   options: `project=${ENDPOINT_ID}`,
    // },
  });

  try {
    const result = await sql`select version()`;
    if (result[0].version)
      console.log(
        clc.blueBright(
          `✓ Postgres connection established..! Version: ${result[0].version}`
        )
      );
  } catch (error) {
    console.error("Failed to connect to Postgres:", error);
  }

  return sql;
}

module.exports = initializeConnection;
