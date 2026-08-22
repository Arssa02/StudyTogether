const plannedSessionService = require('../services/plannedSessionService');

const create = async (req, res, next) => {
    try {
        const session = await plannedSessionService.createPlannedSession(
            req.user.id,
            req.body
        );

        return res.status(201).json({ session });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getMine = async (req, res, next) => {
    try {
        const sessions = await plannedSessionService.getMyPlannedSessions(
            req.user.id
        );

        return res.status(200).json({ sessions });
    } catch (err) {
        return next(err);
    }
};

const update = async (req, res, next) => {
    try {
        const session = await plannedSessionService.updatePlannedSession(
            req.user.id,
            Number(req.params.id),
            req.body
        );

        return res.status(200).json({ session });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const remove = async (req, res, next) => {
    try {
        const result = await plannedSessionService.deletePlannedSession(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getFriend = async (req, res, next) => {
    try {
        const sessions = await plannedSessionService.getFriendPlannedSessions(
            req.user.id,
            Number(req.params.friendId)
        );

        return res.status(200).json({ sessions });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

module.exports = {
    create,
    getMine,
    getFriend,
    update,
    remove,
};