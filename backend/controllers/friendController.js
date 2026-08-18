const friendService = require('../services/friendService');

const sendRequest = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const request = await friendService.sendFriendRequest(
            req.user.id,
            email
        );

        return res.status(201).json({ request });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getRequests = async (req, res, next) => {
    try {
        const requests = await friendService.getIncomingRequests(req.user.id);
        return res.status(200).json({ requests });
    } catch (err) {
        return next(err);
    }
};

const acceptRequest = async (req, res, next) => {
    try {
        const result = await friendService.acceptFriendRequest(
            req.user.id,
            req.params.id
        );

        return res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const declineRequest = async (req, res, next) => {
    try {
        const result = await friendService.declineFriendRequest(
            req.user.id,
            req.params.id
        );

        return res.status(200).json(result);
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ error: err.message });
        }

        return next(err);
    }
};

const getFriends = async (req, res, next) => {
    try {
        const friends = await friendService.getFriends(req.user.id);
        return res.status(200).json({ friends });
    } catch (err) {
        return next(err);
    }
};

const removeFriend = async (req, res, next) => {
    try {
        const result = await friendService.removeFriend(
            req.user.id,
            req.params.id
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
    sendRequest,
    getRequests,
    acceptRequest,
    declineRequest,
    getFriends,
    removeFriend,
};