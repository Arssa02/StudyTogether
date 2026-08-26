const db = require('../config/database');

const create = async ({ userId, sessionId }) => {
    const sql = `
        INSERT INTO participation (user_id, session_id, joined_at, left_at)
        VALUES (?, ?, NOW(), NULL)
    `;

    const [result] = await db.execute(sql, [userId, sessionId]);
    return result.insertId;
};

const findActiveByUserAndSession = async (userId, sessionId) => {
    const sql = `
        SELECT id, user_id, session_id, joined_at, left_at
        FROM participation
        WHERE user_id = ?
          AND session_id = ?
          AND left_at IS NULL
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [userId, sessionId]);
    return rows[0] || null;
};

const leave = async (participationId) => {
    const sql = `
        UPDATE participation
        SET left_at = NOW()
        WHERE id = ? AND left_at IS NULL
    `;

    await db.execute(sql, [participationId]);
};

const countActiveBySession = async (sessionId) => {
    const sql = `
        SELECT COUNT(*) AS count
        FROM participation
        WHERE session_id = ?
          AND left_at IS NULL
    `;

    const [rows] = await db.execute(sql, [sessionId]);
    return Number(rows[0].count);
};

const getActiveParticipants = async (sessionId) => {
    const sql = `
        SELECT
            p.id AS participation_id,
            u.id AS user_id,
            u.first_name,
            u.last_name,
            p.joined_at,
            sa.type AS activity_type
        FROM participation p
        JOIN user u
            ON u.id = p.user_id
        LEFT JOIN study_activity sa
            ON sa.participation_id = p.id
            AND sa.end_time IS NULL
        WHERE p.session_id = ?
            AND p.left_at IS NULL
        ORDER BY p.joined_at ASC
    `;

    const [rows] = await db.execute(sql, [sessionId]);

    return rows;
};

module.exports = {
    create,
    findActiveByUserAndSession,
    leave,
    countActiveBySession,
    getActiveParticipants,
};