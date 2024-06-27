const postgres = require("postgres");
const clc = require("cli-color");

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: "require",
  connection: {
    options: `project=${ENDPOINT_ID}`,
  },
});

async function getPgVersion() {
  try {
    const result = await sql`select version()`;
    if (result[0].version)
      console.log(
        clc.blueBright(
          `✓ Postgres connection established..! Version: ${result[0].version}`
        )
      );
  } catch (error) {
    console.error(error);
  }
}

getPgVersion();

module.exports = sql;