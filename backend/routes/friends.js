const express = require('express');
const friendController = require('../controllers/friendController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Every friend route requires login.
router.use(authenticateToken);

// Accepted friends
router.get('/', friendController.getFriends);
router.delete('/:id', friendController.removeFriend);

// Friend requests
router.post('/requests', friendController.sendRequest);
router.get('/requests', friendController.getRequests);
router.patch('/requests/:id/accept', friendController.acceptRequest);
router.delete('/requests/:id', friendController.declineRequest);

module.exports = router;