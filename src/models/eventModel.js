const sql = require("../helpers/sql");

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
        event_image VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

  static async create({ title, description, date, time, event_image }) {
    const [event] = await sql`
      INSERT INTO Events (
        title, description, date, time, event_image
      ) VALUES (
        ${title}, ${description}, ${date}, ${time}, ${event_image}
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
      SELECT id, title, description, date, time, event_image, "createdAt", "updatedAt"
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

  static async update(id, { title, description, date, time, event_image }) {
    const [event] = await sql`
      UPDATE Events SET
        title = ${title},
        description = ${description},
        date = ${date},
        time = ${time},
        event_image = ${event_image},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return event;
  }

  static async count() {
    const [event] = await sql`
      SELECT COUNT(*) FROM Events
    `;
    return event.count;
  }

  static async delete(id) {
    await sql`
      DELETE FROM Events WHERE id = ${id}
    `;
    return true;
  }
}

module.exports = Event;
