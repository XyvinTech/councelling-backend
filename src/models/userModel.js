const sql = require("../helpers/sql");

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
      INSERT INTO Users (name, email, password, mobile, userType, parentContact, counsellorType, experience, designation)
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

  static async createMany(users) {
    const values = users.map((user) => [
      user.name,
      user.email,
      user.password,
      user.mobile,
      user.userType,
      user.parentContact || null,
      user.counsellorType || null,
      user.experience || null,
      user.designation,
    ]);

    const insertedUsers = await sql`
      INSERT INTO Users (name, email, password, mobile, userType, parentContact, counsellorType, experience, designation)
      SELECT * FROM UNNEST(
        ${sql.array(
          values.map((value) => value[0]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[1]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[2]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[3]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[4]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[5]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[6]),
          "text"
        )},
        ${sql.array(
          values.map((value) => value[7]),
          "int"
        )},
        ${sql.array(
          values.map((value) => value[8]),
          "text"
        )}
      )
      RETURNING *
    `;

    return insertedUsers;
  }

  static async findAll({
    page = 1,
    limit = 10,
    userType,
    searchQuery = "",
  } = {}) {
    const offset = (page - 1) * limit;
    let filterCondition = sql``;

    if (userType) {
      filterCondition = sql`
        WHERE "usertype" = ${userType}
      `;
    }

    if (searchQuery) {
      filterCondition = sql`
        ${filterCondition.length > 0 ? sql` AND` : sql` WHERE`}
        (name ILIKE ${"%" + searchQuery + "%"}
        OR email ILIKE ${"%" + searchQuery + "%"})
      `;
    }

    return await sql`
      SELECT id, name, email, status, mobile, designation, parentcontact, experience
      FROM Users
      ${filterCondition}
      OFFSET ${offset} LIMIT ${limit}
    `;
  }

  static async find(criteria = {}) {
    // Building dynamic filter conditions
    const conditions = Object.entries(criteria).map(([key, value]) => {
      return sql`${sql(key)} = ${value}`;
    });

    // Combining conditions with AND if there are multiple
    const filterCondition =
      conditions.length > 0
        ? sql`WHERE ${sql.join(conditions, sql` AND `)}`
        : sql``;

    // Querying the database
    const users = await sql`
      SELECT id, name, email, status, mobile, designation, parentContact, experience
      FROM Users
      ${filterCondition}
    `;

    return users;
  }

  static async findAllCounsellors({ counsellorType }) {
    let filterCondition = sql`WHERE userType = 'counsellor' AND status = true`;

    if (counsellorType) {
      filterCondition = sql`${filterCondition} AND counsellortype = ${counsellorType}`;
    }

    const counsellors = await sql`
      SELECT id, name, email, status, mobile, designation, experience, counsellorType
      FROM Users
      ${filterCondition}
    `;

    return counsellors;
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

  static async findOne(criteria) {
    const key = Object.keys(criteria)[0];
    const value = criteria[key];
    const [user] = await sql`
    SELECT * FROM Users WHERE ${sql(key)} = ${value}
  `;
    return user;
  }

  static async update(
    id,
    {
      name,
      email,
      mobile,
      status,
      designation,
      parentContact = null,
      experience = null,
    }
  ) {
    const [user] = await sql`
    UPDATE Users SET
      name = ${name},
      email = ${email},
      designation = ${designation},
      experience = ${experience},
      parentContact = ${parentContact},
      mobile = ${mobile},
      status = ${status},
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
    return user;
  }

  static async count({ userType } = {}) {
    let filterCondition = sql``;

    if (userType) {
      filterCondition = sql`
        WHERE "usertype" = ${userType}
      `;
    }

    const [result] = await sql`
      SELECT COUNT(*) AS count
      FROM Users
      ${filterCondition}
    `;

    return result.count;
  }

  static async delete(id) {
    await sql`
    DELETE FROM Users WHERE id = ${id}
  `;
    return true;
  }
}

module.exports = User;
