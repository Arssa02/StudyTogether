const db = require('../config/database');

// Returns full user row for auth flow (includes hashed password).
const findByEmail = async (email) => {
	const sql = 'SELECT id, first_name, last_name, email, password FROM user WHERE email = ? LIMIT 1';
	const [rows] = await db.execute(sql, [email]);
	return rows[0] || null;
};

// Returns profile-safe user data only (no password).
const findById = async (id) => {
	const sql = 'SELECT id, first_name, last_name, email FROM user WHERE id = ? LIMIT 1';
	const [rows] = await db.execute(sql, [id]);
	return rows[0] || null;
};

// Inserts a new user and returns the generated user id.
const createUser = async ({ firstName, lastName, email, hashedPassword }) => {
	const sql = `
		INSERT INTO user (first_name, last_name, email, password)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.execute(sql, [firstName, lastName, email, hashedPassword]);
	return result.insertId;
};

// makes functions usable in other files
module.exports = {
	findByEmail,
	findById,
	createUser,
};
