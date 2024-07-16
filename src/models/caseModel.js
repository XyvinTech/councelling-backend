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
                status VARCHAR(255) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled', 'closed')),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_ids UUID[] -- Array of session IDs
            );
        `;
    }

    static async create({ user, sessions }) {
        const [newCase] = await sql`
            INSERT INTO Cases (
                "user", session_ids
            ) VALUES (
                ${user}, ${sql.array(sessions, 'uuid')}
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

    static async findAll({ page = 1, limit = 10, searchQuery = "" } = {}) {
        const offset = (page - 1) * limit;
        let filterCondition = sql``;

        if (searchQuery) {
            filterCondition = sql`WHERE "user"::text ILIKE ${'%' + searchQuery + '%'}`;
        }

        const cases = await sql`
            SELECT 
                Cases.*,
                json_agg(Sessions.*) as sessions
            FROM Cases
            LEFT JOIN Sessions ON Sessions.id = ANY(Cases.session_ids)
            ${filterCondition}
            GROUP BY Cases.id
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
            LEFT JOIN Sessions ON Sessions.id = ANY(Cases.session_ids)
            WHERE Cases.id = ${id}
            GROUP BY Cases.id
        `;

        return caseRow;
    }

    static async update(id, { sessions, status }) {
        const [updatedCase] = await sql`
            UPDATE Cases SET
                session_ids = ${sql.array(sessions, 'uuid')},
                status = ${status},
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

    static async delete(id) {
        await sql`
            DELETE FROM Cases WHERE id = ${id}
        `;
        return true;
    }
}

module.exports = Case;
