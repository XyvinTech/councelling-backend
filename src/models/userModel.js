const sql = require("../helpers/sql");

class User {
  static async createTable() {
    // Ensure the UUID extension is enabled
    await sql`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `;

    // Create the Admins table with UUID primary key
    await sql`
      CREATE TABLE IF NOT EXISTS Members (
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

  static async create({
    name,
    email,
    password,
    mobile,
    userType,
    designation,
    parentContact = null,
    counsellorType = null,
    experience = null,
  }) {
    const [user] = await sql`
      INSERT INTO Members (name, email, password, mobile, userType, parentContact, counsellorType, experience, designation)
      VALUES (
        ${name}, 
        ${email}, 
        ${password}, 
        ${mobile}, 
        ${userType}, 
        ${parentContact}, 
        ${counsellorType}, 
        ${experience}, 
        ${designation}
      )
      RETURNING *
    `;
    return user;
  }

  static async findAll({ page = 1, limit = 10, searchQuery = "" } = {}) {
    const offset = (page - 1) * limit;
    let filterCondition = sql``;

    if (searchQuery) {
      filterCondition = sql`
      WHERE name ILIKE ${"%" + searchQuery + "%"}
      OR email ILIKE ${"%" + searchQuery + "%"}
    `;
    }

    return await sql`
    SELECT id, name, email, status, "createdAt", "updatedAt"
    FROM Members
    ${filterCondition}
    OFFSET ${offset} LIMIT ${limit}
  `;
  }

  static async findById(id) {
    const [user] = await sql`
    SELECT * FROM Members WHERE id = ${id}
  `;
    if (user) {
      delete user.password;
    }
    return user;
  }

  static async findOne(criteria) {
    const key = Object.keys(criteria)[0];
    const value = criteria[key];
    const [user] = await sql`
    SELECT * FROM Members WHERE ${sql(key)} = ${value}
  `;
    return user;
  }

  static async update(id, { name, email, status }) {
    const [user] = await sql`
    UPDATE Members SET
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
    DELETE FROM Members WHERE id = ${id}
  `;
    return true;
  }
}

module.exports = User;
