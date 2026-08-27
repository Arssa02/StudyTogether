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

const getActiveForUser = async (currentUserId) => {
    const sql = `
        SELECT
            s.id,
            s.creator_id,
            s.title,
            s.start_time,

            creator.first_name,
            creator.last_name,

            COUNT(DISTINCT active_participants.id) AS participant_count,

            MAX(
                CASE
                    WHEN my_participation.user_id = ?
                         AND my_participation.left_at IS NULL
                    THEN 1
                    ELSE 0
                END
            ) AS is_participating

        FROM study_session s

        JOIN user creator
            ON creator.id = s.creator_id

        LEFT JOIN participation active_participants
            ON active_participants.session_id = s.id
           AND active_participants.left_at IS NULL

        LEFT JOIN participation my_participation
            ON my_participation.session_id = s.id
           AND my_participation.user_id = ?

        WHERE s.end_time IS NULL

          AND (
              EXISTS (
                  SELECT 1
                  FROM participation p_me
                  WHERE p_me.session_id = s.id
                    AND p_me.user_id = ?
                    AND p_me.left_at IS NULL
              )

              OR EXISTS (
                  SELECT 1
                  FROM friend f
                  WHERE f.status = 'accepted'
                    AND (
                        (f.user_id = ? AND f.friend_id = s.creator_id)
                        OR
                        (f.friend_id = ? AND f.user_id = s.creator_id)
                    )
              )
          )

        GROUP BY
            s.id,
            s.creator_id,
            s.title,
            s.start_time,
            creator.first_name,
            creator.last_name

        ORDER BY s.start_time DESC
    `;

    const [rows] = await db.execute(sql, [
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
        currentUserId,
    ]);

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
    getActiveForUser,
    endSession,
};