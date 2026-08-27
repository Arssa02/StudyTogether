const db = require('../config/database');

// Find an existing friendship/request for a pair of users.
const findByPair = async (userId, friendId) => {
    const sql = `
        SELECT id, user_id, friend_id, requested_by, status, created_on
        FROM friend
        WHERE user_id = ? AND friend_id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [userId, friendId]);
    return rows[0] || null;
};

// Create a pending friend request.
const createRequest = async ({ userId, friendId, requestedBy }) => {
    const sql = `
        INSERT INTO friend (user_id, friend_id, requested_by, status)
        VALUES (?, ?, ?, 'pending')
    `;

    const [result] = await db.execute(sql, [
        userId,
        friendId,
        requestedBy,
    ]);

    return result.insertId;
};

// Find one friendship/request by id.
const findById = async (id) => {
    const sql = `
        SELECT id, user_id, friend_id, requested_by, status, created_on
        FROM friend
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
};

// Return pending requests sent TO the current user.
const getIncomingRequests = async (currentUserId) => {
    const sql = `
        SELECT
            f.id,
            f.requested_by,
            f.created_on,
            u.id AS requester_id,
            u.first_name,
            u.last_name,
            u.email
        FROM friend f
        JOIN user u ON u.id = f.requested_by
        WHERE f.status = 'pending'
          AND f.requested_by <> ?
          AND (f.user_id = ? OR f.friend_id = ?)
        ORDER BY f.created_on DESC
    `;

    const [rows] = await db.execute(sql, [
        currentUserId,
        currentUserId,
        currentUserId,
    ]);

    return rows;
};

// Change pending request to accepted friendship.
const acceptRequest = async (id) => {
    const sql = `
        UPDATE friend
        SET status = 'accepted'
        WHERE id = ?
    `;

    await db.execute(sql, [id]);
};

// Delete a request or friendship.
const deleteById = async (id) => {
    const sql = `
        DELETE FROM friend
        WHERE id = ?
    `;

    await db.execute(sql, [id]);
};

// Return accepted friends of current user.
const getAcceptedFriends = async (currentUserId) => {
    const sql = `
        SELECT
            f.id AS friendship_id,
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            f.created_on
        FROM friend f
        JOIN user u
          ON u.id = CASE
              WHEN f.user_id = ? THEN f.friend_id
              ELSE f.user_id
          END
        WHERE f.status = 'accepted'
          AND (f.user_id = ? OR f.friend_id = ?)
        ORDER BY u.first_name, u.last_name
    `;

    const [rows] = await db.execute(sql, [
        currentUserId,
        currentUserId,
        currentUserId,
    ]);

    return rows;
};

const areAcceptedFriends = async (userAId, userBId) => {
    const userId = Math.min(userAId, userBId);
    const friendId = Math.max(userAId, userBId);

    const sql = `
        SELECT id
        FROM friend
        WHERE user_id = ?
          AND friend_id = ?
          AND status = 'accepted'
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [userId, friendId]);
    return rows.length > 0;
};

const getAcceptedFriendsWithStatus = async (currentUserId) => {
    const sql = `
        SELECT
            f.id AS friendship_id,
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            f.created_on,

            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM participation p
                    JOIN study_session ss
                        ON ss.id = p.session_id
                    JOIN study_activity sa
                        ON sa.participation_id = p.id
                    WHERE p.user_id = u.id
                      AND p.left_at IS NULL
                      AND ss.end_time IS NULL
                      AND sa.end_time IS NULL
                      AND sa.type = 'study'
                )
                THEN 'studying'

                WHEN EXISTS (
                    SELECT 1
                    FROM participation p
                    JOIN study_session ss
                        ON ss.id = p.session_id
                    JOIN study_activity sa
                        ON sa.participation_id = p.id
                    WHERE p.user_id = u.id
                      AND p.left_at IS NULL
                      AND ss.end_time IS NULL
                      AND sa.end_time IS NULL
                      AND sa.type = 'break'
                )
                THEN 'break'

                ELSE 'offline'
            END AS study_status

        FROM friend f

        JOIN user u
          ON u.id = CASE
              WHEN f.user_id = ? THEN f.friend_id
              ELSE f.user_id
          END

        WHERE f.status = 'accepted'
          AND (f.user_id = ? OR f.friend_id = ?)

        ORDER BY
            CASE study_status
                WHEN 'studying' THEN 1
                WHEN 'break' THEN 2
                ELSE 3
            END,
            u.first_name,
            u.last_name
    `;

    const [rows] = await db.execute(sql, [
        currentUserId,
        currentUserId,
        currentUserId,
    ]);

    return rows;
};

const getAcceptedFriendIds = async (currentUserId) => {
    const sql = `
        SELECT
            CASE
                WHEN user_id = ? THEN friend_id
                ELSE user_id
            END AS friend_id
        FROM friend
        WHERE status = 'accepted'
          AND (user_id = ? OR friend_id = ?)
    `;

    const [rows] = await db.execute(sql, [
        currentUserId,
        currentUserId,
        currentUserId,
    ]);

    return rows.map((row) => row.friend_id);
};

module.exports = {
    findByPair,
    createRequest,
    findById,
    getIncomingRequests,
    acceptRequest,
    deleteById,
    getAcceptedFriends,
    getAcceptedFriendsWithStatus,
    areAcceptedFriends,
    getAcceptedFriendIds
};