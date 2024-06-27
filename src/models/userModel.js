const sql = require("../helpers/connection");

class User {
  static async createTable() {
    // Ensure the UUID extension is enabled
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `;

    // Create the Admins table with UUID primary key
    await sql`
      CREATE TABLE IF NOT EXISTS Users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        mobile VARCHAR(255) NOT NULL UNIQUE,
        designation VARCHAR(255) NOT NULL,
        userType VARCHAR(255) NOT NULL,
        counsellorType VARCHAR(255),
        experience INT,
        parentContact VARCHAR(255),
        status BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  }

static async createStudent({ name, email, password, mobile, userType, parentContact }) {
  const [user] = await sql`
    INSERT INTO Users (name, email, password, mobile, userType, parentContact)
    VALUES (${name}, ${email}, ${password}, ${mobile}, ${userType}, ${parentContact})
    RETURNING *
  `;
  return user;
}

static async createCounsellor({ name, email, password, mobile, userType, counsellorType, experience, designation }) {
  const [user] = await sql`
    INSERT INTO Users (name, email, password, mobile, userType, counsellorType, experience, designation)
    VALUES (${name}, ${email}, ${password}, ${mobile}, ${userType}, ${counsellorType}, ${experience}, ${designation})
    RETURNING *
  `;
  return user;
}

static async findAll({ page = 1, limit = 10, searchQuery = '' } = {}) {
  const offset = (page - 1) * limit;
  let filterCondition = sql``;

  if (searchQuery) {
    filterCondition = sql`
      WHERE name ILIKE ${'%' + searchQuery + '%'}
      OR email ILIKE ${'%' + searchQuery + '%'}
    `;
  }

  return await sql`
    SELECT id, name, email, status, "createdAt", "updatedAt"
    FROM Users
    ${filterCondition}
    OFFSET ${offset} LIMIT ${limit}
  `;
}

static async findById(id) {
  const [user] = await sql`
    SELECT * FROM Users WHERE id = ${id}
  `;
  if (user) {
    delete user.password;
  }
  return user;
}

static async findByEmail(email) {
  const [user] = await sql`
    SELECT * FROM Users WHERE email = ${email}
  `;
  return user;
}

static async update(id, { name, email, status }) {
  const [user] = await sql`
    UPDATE Users SET
      name = ${name},
      email = ${email},
      status = ${status},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return user;
}

static async delete(id) {
  await sql`
    DELETE FROM Users WHERE id = ${id}
  `;
  return true;
}
}

module.exports = User;