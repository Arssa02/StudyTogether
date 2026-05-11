const userService = require('../services/userService');

// register new user
const register = async (req, res, next) => {
	try {
		const { firstName, lastName, email, password } = req.body; // data sent from frontend
        // call service to handle registration by checking email, hashing password, store user
        // and return safe user
		const user = await userService.registerUser({ firstName, lastName, email, password });
		return res.status(201).json({ user }); // 201 -> resource created
	} catch (err) { // userService throws an error and authController catches it
		if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
		return next(err); // unknown error - pass error to global error handler
                          // which is in server.js and returns internal server error
	}
};

// login existing user
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await userService.loginUser({ email, password });
		return res.status(200).json(result); // 200 meaning OK (successful login)
	} catch (err) {
		if (err.statusCode) return res.status(err.statusCode).json({ error: err.message });
		return next(err);
	}
};

// make functions usable in routes
module.exports = {
	register,
	login,
};

