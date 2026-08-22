const studySessionModel = require('../models/studySessionModel');
const participationModel = require('../models/participationModel');
const plannedSessionModel = require('../models/plannedSessionModel');
const friendModel = require('../models/friendModel');
const studyActivityService = require('./studyActivityService');

const startSpontaneousSession = async (currentUserId, title) => {
    const sessionId = await studySessionModel.create({
        creatorId: currentUserId,
        title: title && title.trim() ? title.trim() : null,
    });

    await participationModel.create({
        userId: currentUserId,
        sessionId,
    });

    return studySessionModel.findById(sessionId);
};

const startFromPlannedSession = async (currentUserId, plannedSessionId) => {
    const planned = await plannedSessionModel.findById(plannedSessionId);

    if (!planned) {
        const error = new Error('Planned session not found');
        error.statusCode = 404;
        throw error;
    }

    if (planned.session_id) {
        const error = new Error('This planned session has already been started');
        error.statusCode = 409;
        throw error;
    }

    const now = new Date();
    const start = new Date(planned.start_time);
    const end = new Date(planned.end_time);

    if (now < start || now > end) {
        const error = new Error(
            'Planned session can only be started during its scheduled time'
        );
        error.statusCode = 400;
        throw error;
    }

    // Planner is always allowed.
    let allowed = planned.user_id === currentUserId;

    // Otherwise the starter must be an accepted friend of the planner.
    if (!allowed) {
        allowed = await friendModel.areAcceptedFriends(
            currentUserId,
            planned.user_id
        );
    }

    if (!allowed) {
        const error = new Error(
            'You are not allowed to start this planned session'
        );
        error.statusCode = 403;
        throw error;
    }

    const sessionId = await studySessionModel.create({
        creatorId: currentUserId,
        title: planned.title,
    });

    const linked = await plannedSessionModel.attachStudySession(
        plannedSessionId,
        sessionId
    );

    if (!linked) {
        const error = new Error('This planned session has already been started');
        error.statusCode = 409;
        throw error;
    }

    await participationModel.create({
        userId: currentUserId,
        sessionId,
    });

    return studySessionModel.findById(sessionId);
};

const getActiveSessions = async () => {
    return studySessionModel.getActive();
};

const joinSession = async (currentUserId, sessionId) => {
    const session = await studySessionModel.findById(sessionId);

    if (!session || session.end_time) {
        const error = new Error('Active study session not found');
        error.statusCode = 404;
        throw error;
    }

    const existing = await participationModel.findActiveByUserAndSession(
        currentUserId,
        sessionId
    );

    if (existing) {
        const error = new Error('You are already participating in this session');
        error.statusCode = 409;
        throw error;
    }

    // Only creator or accepted friends of creator may join.
    if (session.creator_id !== currentUserId) {
        const areFriends = await friendModel.areAcceptedFriends(
            currentUserId,
            session.creator_id
        );

        if (!areFriends) {
            const error = new Error(
                'You can only join active sessions of accepted friends'
            );
            error.statusCode = 403;
            throw error;
        }
    }

    const participationId = await participationModel.create({
        userId: currentUserId,
        sessionId,
    });

    return { participationId };
};

const leaveSession = async (currentUserId, sessionId) => {
    const participation =
        await participationModel.findActiveByUserAndSession(
            currentUserId,
            sessionId
        );

    if (!participation) {
        const error = new Error('You are not currently in this session');
        error.statusCode = 404;
        throw error;
    }

    await studyActivityService.closeCurrentActivity(participation.id);

    await participationModel.leave(participation.id);

    const activeCount =
        await participationModel.countActiveBySession(sessionId);

    if (activeCount === 0) {
        await studySessionModel.endSession(sessionId);
    }

    return {
        message: 'Left study session',
        sessionEnded: activeCount === 0,
    };
};

const getParticipants = async (currentUserId, sessionId) => {
    const session = await studySessionModel.findById(sessionId);

    if (!session) {
        const error = new Error('Study session not found');
        error.statusCode = 404;
        throw error;
    }

    const participation =
        await participationModel.findActiveByUserAndSession(
            currentUserId,
            sessionId
        );

    if (!participation) {
        const error = new Error(
            'You must be participating in the session to view the study room'
        );
        error.statusCode = 403;
        throw error;
    }

    return participationModel.getActiveParticipants(sessionId);
};

module.exports = {
    startSpontaneousSession,
    startFromPlannedSession,
    getActiveSessions,
    joinSession,
    leaveSession,
    getParticipants,
};