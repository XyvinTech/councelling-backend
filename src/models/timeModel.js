const sql = require("../helpers/connection");

class Time {
  static async createTable() {
    // Ensure the UUID extension is enabled
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `;

    // Create the Times table with UUID primary key and times as a JSONB array
    await sql`
      CREATE TABLE IF NOT EXISTS Times (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user" UUID REFERENCES Users(id),
        day VARCHAR(255),
        times JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  static async create({ user, day, times }) {
    const [timeEntry] = await sql`
      INSERT INTO Times ("user", day, times)
      VALUES (${user}, ${day}, ${sql.json(times)})
      RETURNING *
    `;
    return timeEntry;
  }

  static async findByUserId(userId) {
    const timeEntries = await sql`
      SELECT Times.*, 
      Users.name as user_name
      FROM Times
      LEFT JOIN Users
      ON Times."user" = Users.id
      WHERE "user" = ${userId}
    `;
    return timeEntries;
  }

  static async findTimes(userId, day) {
    const timeEntries = await sql`
        SELECT times, day,
        Users.name AS user_name
        FROM Times
        LEFT JOIN Users ON Times."user" = Users.id
        WHERE Times."user" = ${userId} AND Times.day = ${day}
    `;
    return timeEntries;
  }

  static async update(id, { day, times }) {
    const [updatedTimeEntry] = await sql`
      UPDATE Times
      SET day = ${day}, times = ${sql.json(
      times
    )}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return updatedTimeEntry;
  }

  static async delete(id) {
    await sql`
      DELETE FROM Times WHERE id = ${id}
    `;
    return true;
  }

  static async deleteTime(id, timeToRemove) {
    const [timeEntry] = await sql`
      SELECT times FROM Times WHERE id = ${id}
    `;

    if (!timeEntry) {
      throw new Error("Time entry not found");
    }

    const updatedTimes = timeEntry.times.filter(
      (time) => time !== timeToRemove
    );

    const [updatedTimeEntry] = await sql`
      UPDATE Times
      SET times = ${sql.json(updatedTimes)}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return updatedTimeEntry;
  }
}

module.exports = Time;
