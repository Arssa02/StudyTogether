const plannedSessionModel = require('../models/plannedSessionModel');
const friendModel = require('../models/friendModel');

const validateTimes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        const error = new Error('Invalid start or end time');
        error.statusCode = 400;
        throw error;
    }

    if (end <= start) {
        const error = new Error('End time must be after start time');
        error.statusCode = 400;
        throw error;
    }
};

const createPlannedSession = async (
    currentUserId,
    { title, startTime, endTime }
) => {
    if (!title || !title.trim()) {
        const error = new Error('Title is required');
        error.statusCode = 400;
        throw error;
    }

    if (!startTime || !endTime) {
    const error = new Error(
        'Start time and end time are required'
    );
    error.statusCode = 400;
    throw error;
}

    validateTimes(startTime, endTime);

    const id = await plannedSessionModel.create({
        userId: currentUserId,
        title: title.trim(),
        startTime,
        endTime,
    });

    return plannedSessionModel.findById(id);
};

const getMyPlannedSessions = async (currentUserId) => {
    return plannedSessionModel.getByUserId(currentUserId);
};

const updatePlannedSession = async (
    currentUserId,
    id,
    { title, startTime, endTime }
) => {
    const session = await plannedSessionModel.findById(id);

    if (!session) {
        const error = new Error('Planned session not found');
        error.statusCode = 404;
        throw error;
    }

    if (session.user_id !== currentUserId) {
        const error = new Error('You can only modify your own planned sessions');
        error.statusCode = 403;
        throw error;
    }

    if (!title || !title.trim()) {
        const error = new Error('Title is required');
        error.statusCode = 400;
        throw error;
    }

    validateTimes(startTime, endTime);

    await plannedSessionModel.update({
        id,
        title: title.trim(),
        startTime,
        endTime,
    });

    return plannedSessionModel.findById(id);
};

const deletePlannedSession = async (currentUserId, id) => {
    const session = await plannedSessionModel.findById(id);

    if (!session) {
        const error = new Error('Planned session not found');
        error.statusCode = 404;
        throw error;
    }

    if (session.user_id !== currentUserId) {
        const error = new Error('You can only delete your own planned sessions');
        error.statusCode = 403;
        throw error;
    }

    await plannedSessionModel.remove(id);

    return { message: 'Planned session deleted' };
};

const getFriendPlannedSessions = async (currentUserId, friendId) => {
    if (currentUserId === friendId) {
        const error = new Error('Use your own planned sessions endpoint');
        error.statusCode = 400;
        throw error;
    }

    const areFriends = await friendModel.areAcceptedFriends(
        currentUserId,
        friendId
    );

    if (!areFriends) {
        const error = new Error('You can only view planned sessions of accepted friends');
        error.statusCode = 403;
        throw error;
    }

    return plannedSessionModel.getByUserId(friendId);
};

module.exports = {
    createPlannedSession,
    getMyPlannedSessions,
    getFriendPlannedSessions,
    updatePlannedSession,
    deletePlannedSession,
};