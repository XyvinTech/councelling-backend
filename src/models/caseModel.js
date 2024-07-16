const sql = require("../helpers/connection");

class Case {
  static async createTable() {
    // Ensure the UUID extension is enabled
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `;

    // Create the Cases table with UUID primary key
    await sql`
      CREATE TABLE IF NOT EXISTS Cases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user" UUID REFERENCES Users(id),
        status VARCHAR(255) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'completed')),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_ids VARCHAR -- Comma-separated session IDs
      );
    `;
  }

  static async create({ user, sessions }) {
    const sessionIdsString = sessions.join(",");

    const [newCase] = await sql`
              INSERT INTO Cases (
                "user", session_ids
              ) VALUES (
                ${user}, ${sessionIdsString}
              )
              RETURNING *
            `;

    for (const session of sessions) {
      await sql`
                UPDATE Sessions SET
                  case_id = ${newCase.id}
                WHERE id = ${session}
              `;
    }

    return newCase;
  }

  static async findAll({
    userId,
    page = 1,
    searchQuery = "",
    limit = 10,
  } = {}) {
    const offset = (page - 1) * limit;
    let filterCondition = sql``;

    if (searchQuery) {
      filterCondition = sql`AND Cases."user"::text ILIKE ${
        "%" + searchQuery + "%"
      }`;
    }

    const cases = await sql`
      SELECT 
        Cases.*,
        Users.name AS user_name,
        json_agg(Sessions.*) AS sessions
      FROM Cases
      LEFT JOIN Users ON Cases."user" = Users.id
      LEFT JOIN Sessions ON Sessions.case_id = Cases.id
      WHERE Sessions.counsellor = ${userId}
      ${filterCondition}
      GROUP BY Cases.id, Users.name
      OFFSET ${offset} LIMIT ${limit}
    `;

    return cases;
  }

  static async findById(id) {
    const [caseRow] = await sql`
      SELECT 
        Cases.*,
        json_agg(Sessions.*) as sessions
      FROM Cases
      LEFT JOIN Sessions ON Sessions.id = ANY(string_to_array(Cases.session_ids, ',')::uuid[])
      WHERE Cases.id = ${id}
      GROUP BY Cases.id
    `;

    return caseRow;
  }

  static async findByUserId(id) {
    const session = await sql`
      SELECT * FROM Cases 
      WHERE "user" = ${id} 
      AND status IN ('pending', 'accepted')
    `;
    return session;
  }

  static async update(id, { sessions }) {
    const sessionIdsString = sessions.join(",");

    const [updatedCase] = await sql`
      UPDATE Cases SET
        session_ids = ${sessionIdsString},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    for (const session of sessions) {
      await sql`
        UPDATE Sessions SET
          case_id = ${id}
        WHERE id = ${session}
      `;
    }

    return updatedCase;
  }

  static async count() {
    const [cases] = await sql`
      SELECT COUNT(*) FROM Cases
    `;
    return cases;
  }

  static async delete(id) {
    await sql`
      DELETE FROM Cases WHERE id = ${id}
    `;
    return true;
  }
}

module.exports = Case;
