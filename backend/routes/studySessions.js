const express = require('express');
const studySessionController = require('../controllers/studySessionController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', studySessionController.start);
router.get('/active', studySessionController.getActive);

router.post(
    '/planned/:plannedSessionId/start',
    studySessionController.startPlanned
);

router.post('/:id/join', studySessionController.join);
router.post('/:id/leave', studySessionController.leave);
router.get('/:id/participants', studySessionController.getParticipants);

module.exports = router;