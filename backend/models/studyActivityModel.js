const db = require('../config/database');

const findOpenByParticipationId = async (participationId) => {
    const sql = `
        SELECT id, participation_id, start_time, end_time, type
        FROM study_activity
        WHERE participation_id = ?
          AND end_time IS NULL
        ORDER BY start_time DESC
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [participationId]);
    return rows[0] || null;
};

const create = async ({ participationId, type }) => {
    const sql = `
        INSERT INTO study_activity (
            participation_id,
            start_time,
            end_time,
            type
        )
        VALUES (?, NOW(), NULL, ?)
    `;

    const [result] = await db.execute(sql, [
        participationId,
        type,
    ]);

    return result.insertId;
};

const close = async (activityId) => {
    const sql = `
        UPDATE study_activity
        SET end_time = NOW()
        WHERE id = ?
          AND end_time IS NULL
    `;

    await db.execute(sql, [activityId]);
};

const findById = async (id) => {
    const sql = `
        SELECT id, participation_id, start_time, end_time, type
        FROM study_activity
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
};

const getByParticipationId = async (participationId) => {
    const sql = `
        SELECT id, participation_id, start_time, end_time, type
        FROM study_activity
        WHERE participation_id = ?
        ORDER BY start_time ASC
    `;

    const [rows] = await db.execute(sql, [participationId]);
    return rows;
};

module.exports = {
    findOpenByParticipationId,
    create,
    close,
    findById,
    getByParticipationId,
};