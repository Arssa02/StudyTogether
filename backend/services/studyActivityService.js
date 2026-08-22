const participationModel = require('../models/participationModel');
const studyActivityModel = require('../models/studyActivityModel');

const getActiveParticipation = async (currentUserId, sessionId) => {
    const participation =
        await participationModel.findActiveByUserAndSession(
            currentUserId,
            sessionId
        );

    if (!participation) {
        const error = new Error(
            'You must be participating in the study session'
        );
        error.statusCode = 403;
        throw error;
    }

    return participation;
};

const startStudying = async (currentUserId, sessionId) => {
    const participation = await getActiveParticipation(
        currentUserId,
        sessionId
    );

    const currentActivity =
        await studyActivityModel.findOpenByParticipationId(
            participation.id
        );

    if (currentActivity) {
        const error = new Error(
            `You already have an active ${currentActivity.type} interval`
        );
        error.statusCode = 409;
        throw error;
    }

    const activityId = await studyActivityModel.create({
        participationId: participation.id,
        type: 'study',
    });

    return studyActivityModel.findById(activityId);
};

const takeBreak = async (currentUserId, sessionId) => {
    const participation = await getActiveParticipation(
        currentUserId,
        sessionId
    );

    const currentActivity =
        await studyActivityModel.findOpenByParticipationId(
            participation.id
        );

    if (!currentActivity || currentActivity.type !== 'study') {
        const error = new Error(
            'You must be actively studying before taking a break'
        );
        error.statusCode = 409;
        throw error;
    }

    await studyActivityModel.close(currentActivity.id);

    const breakId = await studyActivityModel.create({
        participationId: participation.id,
        type: 'break',
    });

    return studyActivityModel.findById(breakId);
};

const resumeStudying = async (currentUserId, sessionId) => {
    const participation = await getActiveParticipation(
        currentUserId,
        sessionId
    );

    const currentActivity =
        await studyActivityModel.findOpenByParticipationId(
            participation.id
        );

    if (!currentActivity || currentActivity.type !== 'break') {
        const error = new Error(
            'You must be on a break before resuming studying'
        );
        error.statusCode = 409;
        throw error;
    }

    await studyActivityModel.close(currentActivity.id);

    const activityId = await studyActivityModel.create({
        participationId: participation.id,
        type: 'study',
    });

    return studyActivityModel.findById(activityId);
};

const getMyActivity = async (currentUserId, sessionId) => {
    const participation = await getActiveParticipation(
        currentUserId,
        sessionId
    );

    const current =
        await studyActivityModel.findOpenByParticipationId(
            participation.id
        );

    const history =
        await studyActivityModel.getByParticipationId(
            participation.id
        );

    return {
        current,
        history,
    };
};

const closeCurrentActivity = async (participationId) => {
    const current =
        await studyActivityModel.findOpenByParticipationId(
            participationId
        );

    if (current) {
        await studyActivityModel.close(current.id);
    }
};

module.exports = {
    startStudying,
    takeBreak,
    resumeStudying,
    getMyActivity,
    closeCurrentActivity,
};