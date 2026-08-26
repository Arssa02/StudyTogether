const studySessionService = require('../services/studySessionService');

const start = async (req, res, next) => {
    try {
        const session =
            await studySessionService.startSpontaneousSession(
                req.user.id,
                req.body.title
            );

        return res.status(201).json({ session });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const startPlanned = async (req, res, next) => {
    try {
        const session =
            await studySessionService.startFromPlannedSession(
                req.user.id,
                Number(req.params.plannedSessionId)
            );

        return res.status(201).json({ session });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getActive = async (req, res, next) => {
    try {
        const sessions = await studySessionService.getActiveSessions();
        return res.status(200).json({ sessions });
    } catch (err) {
        return next(err);
    }
};

const join = async (req, res, next) => {
    try {
        const result = await studySessionService.joinSession(
            req.user.id,
            Number(req.params.id)
        );

        const io = req.app.get('io');

        io
            .to(`study-session-${req.params.id}`)
            .emit('study-room-updated');

        return res.status(201).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const leave = async (req, res, next) => {
    try {
        const result = await studySessionService.leaveSession(
            req.user.id,
            Number(req.params.id)
        );

        const io = req.app.get('io');

        io
            .to(`study-session-${req.params.id}`)
            .emit('study-room-updated');
        io.emit('friend-status-updated');

        return res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getParticipants = async (req, res, next) => {
    try {
        const participants = await studySessionService.getParticipants(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(200).json({ participants });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

module.exports = {
    start,
    startPlanned,
    getActive,
    join,
    leave,
    getParticipants,
};