const express = require('express');
const studySessionController = require('../controllers/studySessionController');
const authenticateToken = require('../middleware/authMiddleware');
const studyActivityController = require('../controllers/studyActivityController');

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

router.post('/:id/activity/start', studyActivityController.start);
router.post('/:id/activity/break', studyActivityController.takeBreak);
router.post('/:id/activity/resume', studyActivityController.resume);
router.get('/:id/activity/me', studyActivityController.getMine);

module.exports = router;