const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users/me
// returns the profile of the currently authenticated user.
router.get('/me', authenticateToken, userController.getMe);

module.exports = router;