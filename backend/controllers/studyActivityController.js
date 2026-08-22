const studyActivityService = require('../services/studyActivityService');

const start = async (req, res, next) => {
    try {
        const activity = await studyActivityService.startStudying(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(201).json({ activity });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const takeBreak = async (req, res, next) => {
    try {
        const activity = await studyActivityService.takeBreak(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(201).json({ activity });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const resume = async (req, res, next) => {
    try {
        const activity = await studyActivityService.resumeStudying(
            req.user.id,
            Number(req.params.id)
        );

        return res.status(201).json({ activity });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getMine = async (req, res, next) => {
    try {
        const result = await studyActivityService.getMyActivity(
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

module.exports = {
    start,
    takeBreak,
    resume,
    getMine,
};