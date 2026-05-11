const userService = require('../services/userService');

// register new user
const register = async (req, res, next) => {
	try {
		const { firstName, lastName, email, password } = req.body;
		const user = await userService.registerUser({ firstName, lastName, email, password });
		return res.status(201).json({ user });
	} catch (err) {
		if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
		return next(err);
	}
};

// login existing user
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await userService.loginUser({ email, password });
		return res.status(200).json(result);
	} catch (err) {
		if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
		return next(err);
	}
};

module.exports = {
	register,
	login,
};

