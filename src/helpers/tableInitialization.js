const { createTable: createSessionTable } = require("../models/sessionModel");
const { createTable: createUserTable } = require("../models/userModel");
const { createTable: createTimeTable } = require("../models/timeModel");
const { createTable: createAdminTable } = require("../models/adminModel");
const { createTable: createEventTable } = require("../models/eventModel");
const { createTable: createCaseTable } = require("../models/caseModel");

async function initializeTables() {
  try {
    await createAdminTable();
    await createCaseTable();
    await createSessionTable();
    await createUserTable();
    await createTimeTable();
    await createEventTable();
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

module.exports = initializeTables;
