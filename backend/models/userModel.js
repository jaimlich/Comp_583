const db = require('./db');
const bcrypt = require('bcrypt');

const createUser = async ({ email, password, name }) => {
  const username = email.split('@')[0];
  const password_hash = await bcrypt.hash(password, 10);
  const role = 'guest';

  const [result] = await db.execute(
    `INSERT INTO users (username, password_hash, email, role)
     VALUES (?, ?, ?, ?)`,
    [username, password_hash, email, role]
  );

  return result.insertId;
};

const getUserByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT * FROM users WHERE email = ?`,
    [email]
  );
  return rows[0];
};

module.exports = {
  createUser,
  getUserByEmail
};
