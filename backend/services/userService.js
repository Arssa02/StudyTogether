const bcrypt = require('bcryptjs'); // used to hash passwords
const jwt = require('jsonwebtoken'); // used to create login tokens (JWT)
const userModel = require('../models/userModel'); // talks to the database

const sanitizeUser = (user) => ({
	id: user.id,
	firstName: user.first_name,
	lastName: user.last_name,
	email: user.email,
});

// creates a new account after checking for duplicate email and hashing the password.
const registerUser = async ({ firstName, lastName, email, password }) => {
	const existingUser = await userModel.findByEmail(email);

	if (existingUser) {
		const error = new Error('Email already exists');
		error.statusCode = 409; // 409 means conflict (resource already exists)
		throw error;
	}

    // saltRounds - how hard bcrypt works to hash a password
    // generates a salt(random string) -> combines it with the password -> hashes multiple times
    // saltRounds=10 means 2^10=1024 hashing operations - a balanced pick between security and speed
	const saltRounds = 10;
    // example: password "123456" becomes $2a$10$Xk9...
	const hashedPassword = await bcrypt.hash(password, saltRounds); 

	const userId = await userModel.createUser({
		firstName,
		lastName,
		email,
		hashedPassword,
	});

	const createdUser = await userModel.findById(userId); // fetch created user
	return sanitizeUser(createdUser); // return safe user (no password and clean format)
};

// Validates credentials and returns a JWT plus safe user data.
const loginUser = async ({ email, password }) => {
	const user = await userModel.findByEmail(email);

	if (!user) {
        // for the security reason don't reveal which one is wrong
		const error = new Error('Invalid email or password');
		error.statusCode = 401;
		throw error;
	}

    // compare plain with hashed password
	const isPasswordValid = await bcrypt.compare(password, user.password); 

	if (!isPasswordValid) {
		const error = new Error('Invalid email or password');
		error.statusCode = 401;
		throw error;
	}

	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	);

    // final response -> { token: "JWT_TOKEN", user: { id: 1, firstName: "Arsenije", 
    // lastName: "...",    email: "..." }}
    // return token (for authentication) and user (for displaying info)
	return {
		token,
		user: sanitizeUser(user),
	};
};

// returns the currently authenticated user's safe profile data.
const getUserById = async (id) => {
    const user = await userModel.findById(id);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return sanitizeUser(user);
};

// makes functions usable in controllers
module.exports = {
    registerUser,
    loginUser,
    getUserById,
};
