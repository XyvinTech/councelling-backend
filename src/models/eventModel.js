const sql = require("../helpers/connection");

class Event {
  static async createTable() {
    // Ensure the UUID extension is enabled
    await sql`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `;

    // Create the Admins table with UUID primary key
    await sql`
      CREATE TABLE IF NOT EXISTS Events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255),
        description TEXT,
        date DATE,
        time TIME,
        duration VARCHAR(255),
        venue VARCHAR(255),
        guest VARCHAR(255),
        doc VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  static async create({
    title,
    description,
    date,
    time,
    duration,
    venue,
    guest,
    doc,
  }) {
    const [event] = await sql`
      INSERT INTO Events (
        title, description, date, time, duration, venue, guest, doc
      ) VALUES (
        ${title}, ${description}, ${date}, ${time}, ${duration}, ${venue}, ${guest}, ${doc}
      )
      RETURNING *
    `;
    return event;
  }

  static async findAll({ page = 1, limit = 10, searchQuery = "" } = {}) {
    const offset = (page - 1) * limit;
    let filterCondition = sql``;

    if (searchQuery) {
      filterCondition = sql`
        WHERE title ILIKE ${"%" + searchQuery + "%"}
        OR description ILIKE ${"%" + searchQuery + "%"}
      `;
    }

    return await sql`
      SELECT id, title, description, date, time, duration, venue, guest, doc, "createdAt", "updatedAt"
      FROM Events
      ${filterCondition}
      OFFSET ${offset} LIMIT ${limit}
    `;
  }

  static async findById(id) {
    const [event] = await sql`
      SELECT * FROM Events WHERE id = ${id}
    `;
    return event;
  }

  static async update(
    id,
    { title, description, date, time, duration, venue, guest, doc }
  ) {
    const [event] = await sql`
      UPDATE Events SET
        title = ${title},
        description = ${description},
        date = ${date},
        time = ${time},
        duration = ${duration},
        venue = ${venue},
        guest = ${guest},
        doc = ${doc},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return event;
  }

  static async delete(id) {
    const [event] = await sql`
      DELETE FROM Events WHERE id = ${id}
    `;
    return event;
  }
}

module.exports = Event;
