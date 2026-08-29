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
            ) AS sessions_completed,

            COALESCE(
                SUM(
                    CASE
                        WHEN sa.type = 'study'
                            AND sa.start_time < NOW()
                            AND COALESCE(sa.end_time, NOW()) > CURDATE()
                        THEN TIMESTAMPDIFF(
                            SECOND,
                            GREATEST(sa.start_time, CURDATE()),
                            LEAST(COALESCE(sa.end_time, NOW()), NOW())
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS today_study_seconds,

            COUNT(
                DISTINCT CASE
                    WHEN sa.type = 'study'
                        AND sa.start_time < NOW()
                        AND COALESCE(sa.end_time, NOW()) > CURDATE()
                    THEN p.session_id
                END
            ) AS today_sessions,

            COALESCE(
                SUM(
                    CASE
                        WHEN sa.type = 'study'
                            AND sa.start_time < NOW()
                            AND COALESCE(sa.end_time, NOW()) >
                                DATE_SUB(
                                    CURDATE(),
                                    INTERVAL WEEKDAY(CURDATE()) DAY
                                )
                        THEN TIMESTAMPDIFF(
                            SECOND,
                            GREATEST(
                                sa.start_time,
                                DATE_SUB(
                                    CURDATE(),
                                    INTERVAL WEEKDAY(CURDATE()) DAY
                                )
                            ),
                            LEAST(
                                COALESCE(sa.end_time, NOW()),
                                NOW()
                            )
                        )
                        ELSE 0
                    END
                ),
                0
            ) AS week_study_seconds,

            COUNT(
                DISTINCT CASE
                    WHEN sa.type = 'study'
                        AND sa.start_time < NOW()
                        AND COALESCE(sa.end_time, NOW()) >
                            DATE_SUB(
                                CURDATE(),
                                INTERVAL WEEKDAY(CURDATE()) DAY
                            )
                    THEN p.session_id
                END
            ) AS week_sessions

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
        todayStudySeconds: Number(
            rows[0].today_study_seconds
        ),
        todaySessions: Number(
            rows[0].today_sessions
        ),
        weekStudySeconds: Number(
            rows[0].week_study_seconds
        ),
        weekSessions: Number(
            rows[0].week_sessions
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