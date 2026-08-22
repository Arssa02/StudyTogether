const db = require('../config/database');

const create = async ({ creatorId, title }) => {
    const sql = `
        INSERT INTO study_session (creator_id, title, start_time, end_time)
        VALUES (?, ?, NOW(), NULL)
    `;

    const [result] = await db.execute(sql, [creatorId, title || null]);
    return result.insertId;
};

const findById = async (id) => {
    const sql = `
        SELECT id, creator_id, title, start_time, end_time
        FROM study_session
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
};

const getActive = async () => {
    const sql = `
        SELECT
            s.id,
            s.creator_id,
            s.title,
            s.start_time,
            u.first_name,
            u.last_name,
            COUNT(p.id) AS participant_count
        FROM study_session s
        JOIN user u ON u.id = s.creator_id
        LEFT JOIN participation p
            ON p.session_id = s.id
            AND p.left_at IS NULL
        WHERE s.end_time IS NULL
        GROUP BY
            s.id,
            s.creator_id,
            s.title,
            s.start_time,
            u.first_name,
            u.last_name
        ORDER BY s.start_time DESC
    `;

    const [rows] = await db.execute(sql);
    return rows;
};

const endSession = async (id) => {
    const sql = `
        UPDATE study_session
        SET end_time = NOW()
        WHERE id = ? AND end_time IS NULL
    `;

    await db.execute(sql, [id]);
};

module.exports = {
    create,
    findById,
    getActive,
    endSession,
};