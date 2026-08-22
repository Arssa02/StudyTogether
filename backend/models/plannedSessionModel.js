const db = require('../config/database');

const create = async ({ userId, title, startTime, endTime }) => {
    const sql = `
        INSERT INTO planned_session (user_id, title, start_time, end_time)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
        userId,
        title,
        startTime,
        endTime,
    ]);

    return result.insertId;
};

const findById = async (id) => {
    const sql = `
        SELECT
            id,
            user_id,
            session_id,
            title,
            start_time,
            end_time
        FROM planned_session
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
};

const getByUserId = async (userId) => {
    const sql = `
        SELECT
            id,
            user_id,
            session_id,
            title,
            start_time,
            end_time
        FROM planned_session
        WHERE user_id = ?
        ORDER BY start_time ASC
    `;

    const [rows] = await db.execute(sql, [userId]);
    return rows;
};

const update = async ({ id, title, startTime, endTime }) => {
    const sql = `
        UPDATE planned_session
        SET title = ?, start_time = ?, end_time = ?
        WHERE id = ?
    `;

    await db.execute(sql, [title, startTime, endTime, id]);
};

const remove = async (id) => {
    const sql = `
        DELETE FROM planned_session
        WHERE id = ?
    `;

    await db.execute(sql, [id]);
};

const attachStudySession = async (plannedSessionId, studySessionId) => {
    const sql = `
        UPDATE planned_session
        SET session_id = ?
        WHERE id = ?
          AND session_id IS NULL
    `;

    const [result] = await db.execute(sql, [
        studySessionId,
        plannedSessionId,
    ]);

    return result.affectedRows > 0;
};

module.exports = {
    create,
    findById,
    getByUserId,
    update,
    remove,
    attachStudySession
};