const express = require('express');

const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Everything below requires login
router.use(authenticateToken);

// GET /api/users/me
router.get('/me', userController.getMe);

// GET /api/users/stats
router.get('/stats', userController.getStats);

router.patch('/me', userController.updateMe);

module.exports = router;