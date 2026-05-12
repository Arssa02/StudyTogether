const express = require('express');
// gives me access to authController.register and authController.login
const authController = require('../controllers/authController'); 

const router = express.Router();

// POST /api/auth/register
// Body: { firstName, lastName, email, password }
// Response: { user: { id, firstName, lastName, email } }
router.post('/register', authController.register);

// POST /api/auth/login
// Body: { email, password }
// Response: { token, user: { id, firstName, lastName, email } }
router.post('/login', authController.login);

module.exports = router;
