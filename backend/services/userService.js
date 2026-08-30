const bcrypt = require('bcryptjs'); // used to hash passwords
const jwt = require('jsonwebtoken'); // used to create login tokens (JWT)
const userModel = require('../models/userModel'); // talks to the database

const sanitizeUser = (user) => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
});

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// creates a new account after checking for duplicate email and hashing the password.
const registerUser = async ({
    firstName,
    lastName,
    email,
    password,
}) => {
    if (
        !firstName?.trim() ||
        !lastName?.trim() ||
        !email?.trim() ||
        !password
    ) {
        const error = new Error(
            'First name, last name, email and password are required'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
        const error = new Error('Invalid email format');
        error.statusCode = 400;
        throw error;
    }

    const existingUser =
        await userModel.findByEmail(normalizedEmail);

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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        hashedPassword,
    });

    const createdUser = await userModel.findById(userId); // fetch created user
    return sanitizeUser(createdUser); // return safe user (no password and clean format)
};

const loginUser = async ({ email, password }) => {
    if (!email?.trim() || !password) {
        const error = new Error('Email and password are required');
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel.findByEmail(normalizedEmail);

    if (!user) {
        // For security, don't reveal whether the email or password is wrong.
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Compare plain password with hashed password.
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

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

const getUserStats = async (id) => {
    const user = await userModel.findById(id);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    return userModel.getStudyStats(id);
};

const updateUserProfile = async (
    id,
    { firstName, lastName, email }
) => {
    if (
        !firstName?.trim() ||
        !lastName?.trim() ||
        !email?.trim()
    ) {
        const error = new Error(
            'First name, last name and email are required'
        );
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
        const error = new Error('Invalid email format');
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await userModel.findByEmail(
        normalizedEmail
    );

    if (existingUser && existingUser.id !== id) {
        const error = new Error(
            'Email already exists'
        );
        error.statusCode = 409;
        throw error;
    }

    const updatedUser = await userModel.updateProfile(
        id,
        {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
        }
    );

    return sanitizeUser(updatedUser);
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    getUserStats,
    updateUserProfile,
};
