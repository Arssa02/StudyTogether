const friendModel = require('../models/friendModel');
const userModel = require('../models/userModel');

// Send a friend request using the other user's email.
const sendFriendRequest = async (currentUserId, email) => {
    const targetUser = await userModel.findByEmail(email);

    if (!targetUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (targetUser.id === currentUserId) {
        const error = new Error('You cannot send a friend request to yourself');
        error.statusCode = 400;
        throw error;
    }

    // Always store the smaller id first.
    const userId = Math.min(currentUserId, targetUser.id);
    const friendId = Math.max(currentUserId, targetUser.id);

    const existing = await friendModel.findByPair(userId, friendId);

    if (existing) {
        if (existing.status === 'accepted') {
            const error = new Error('You are already friends');
            error.statusCode = 409;
            throw error;
        }

        const error = new Error('A friend request already exists');
        error.statusCode = 409;
        throw error;
    }

    const requestId = await friendModel.createRequest({
        userId,
        friendId,
        requestedBy: currentUserId,
    });

    return {
        id: requestId,
        requestedUser: {
            id: targetUser.id,
            firstName: targetUser.first_name,
            lastName: targetUser.last_name,
            email: targetUser.email,
        },
        status: 'pending',
    };
};

// Get incoming requests.
const getIncomingRequests = async (currentUserId) => {
    const rows = await friendModel.getIncomingRequests(currentUserId);

    return rows.map((row) => ({
        id: row.id,
        requester: {
            id: row.requester_id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
        },
        createdOn: row.created_on,
    }));
};

// Accept an incoming request.
const acceptFriendRequest = async (currentUserId, requestId) => {
    const request = await friendModel.findById(requestId);

    if (!request || request.status !== 'pending') {
        const error = new Error('Friend request not found');
        error.statusCode = 404;
        throw error;
    }

    const userBelongsToPair =
        request.user_id === currentUserId ||
        request.friend_id === currentUserId;

    if (!userBelongsToPair) {
        const error = new Error('You cannot access this friend request');
        error.statusCode = 403;
        throw error;
    }

    // The person who SENT the request cannot accept their own request.
    if (request.requested_by === currentUserId) {
        const error = new Error('You cannot accept your own friend request');
        error.statusCode = 403;
        throw error;
    }

    await friendModel.acceptRequest(requestId);

    return { message: 'Friend request accepted' };
};

// Decline an incoming request.
const declineFriendRequest = async (currentUserId, requestId) => {
    const request = await friendModel.findById(requestId);

    if (!request || request.status !== 'pending') {
        const error = new Error('Friend request not found');
        error.statusCode = 404;
        throw error;
    }

    const userBelongsToPair =
        request.user_id === currentUserId ||
        request.friend_id === currentUserId;

    if (!userBelongsToPair) {
        const error = new Error('You cannot access this friend request');
        error.statusCode = 403;
        throw error;
    }

    if (request.requested_by === currentUserId) {
        const error = new Error('You cannot decline your own outgoing request');
        error.statusCode = 403;
        throw error;
    }

    await friendModel.deleteById(requestId);

    return { message: 'Friend request declined' };
};

// Get accepted friends.
const getFriends = async (currentUserId) => {
    const rows = await friendModel.getAcceptedFriends(currentUserId);

    return rows.map((row) => ({
        friendshipId: row.friendship_id,
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        friendsSince: row.created_on,
    }));
};

// Remove an accepted friend.
const removeFriend = async (currentUserId, friendshipId) => {
    const friendship = await friendModel.findById(friendshipId);

    if (!friendship || friendship.status !== 'accepted') {
        const error = new Error('Friendship not found');
        error.statusCode = 404;
        throw error;
    }

    const userBelongsToPair =
        friendship.user_id === currentUserId ||
        friendship.friend_id === currentUserId;

    if (!userBelongsToPair) {
        const error = new Error('You cannot remove this friendship');
        error.statusCode = 403;
        throw error;
    }

    await friendModel.deleteById(friendshipId);

    return { message: 'Friend removed' };
};

module.exports = {
    sendFriendRequest,
    getIncomingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    getFriends,
    removeFriend,
};