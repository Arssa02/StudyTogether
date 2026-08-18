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

module.exports = {
    findByPair,
    createRequest,
    findById,
    getIncomingRequests,
    acceptRequest,
    deleteById,
    getAcceptedFriends,
};