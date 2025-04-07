const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');

// POST /api/register
router.post('/register', register);

// POST /api/login
router.post('/login', login);

router.get('/me', me);

module.exports = router;
