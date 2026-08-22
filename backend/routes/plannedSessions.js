const express = require('express');
const plannedSessionController = require('../controllers/plannedSessionController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', plannedSessionController.create);
router.get('/', plannedSessionController.getMine);
router.patch('/:id', plannedSessionController.update);
router.delete('/:id', plannedSessionController.remove);

module.exports = router;