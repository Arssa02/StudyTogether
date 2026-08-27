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

const getStudyStats = async (userId) => {
    const sql = `
        SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN sa.type = 'study'
                        THEN TIMESTAMPDIFF(
                            SECOND,
                            sa.start_time,
                            COALESCE(sa.end_time, NOW())
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS total_study_seconds,

            COUNT(
                DISTINCT CASE
                    WHEN ss.end_time IS NOT NULL
                    THEN p.session_id
                END
            ) AS sessions_completed

        FROM participation p

        LEFT JOIN study_session ss
            ON ss.id = p.session_id

        LEFT JOIN study_activity sa
            ON sa.participation_id = p.id

        WHERE p.user_id = ?
    `;

    const [rows] = await db.execute(sql, [userId]);

    return {
        totalStudySeconds: Number(
            rows[0].total_study_seconds
        ),
        sessionsCompleted: Number(
            rows[0].sessions_completed
        ),
    };
};

const updateProfile = async (id, { firstName, lastName, email }) => {
    const sql = `
        UPDATE user
        SET first_name = ?,
            last_name = ?,
            email = ?
        WHERE id = ?
    `;

    await db.execute(sql, [
        firstName,
        lastName,
        email,
        id,
    ]);

    return findById(id);
};

module.exports = {
    findByEmail,
    findById,
    createUser,
    getStudyStats,
    updateProfile,
};