const userService = require('../services/userService');

// return the currently logged-in user's profile.
const getMe = async (req, res, next) => {
    try {
        // req.user was created by authMiddleware after verifying the JWT.
        const user = await userService.getUserById(req.user.id);

        return res.status(200).json({ user });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getStats = async (req, res, next) => {
    try {
        const stats = await userService.getUserStats(
            req.user.id
        );

        return res.status(200).json({ stats });
    } catch (err) {
        if (err.statusCode) {
            return res
                .status(err.statusCode)
                .json({ error: err.message });
        }

        return next(err);
    }
};

module.exports = {
    getMe,
    getStats,
};