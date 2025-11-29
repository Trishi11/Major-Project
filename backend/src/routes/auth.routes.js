const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Get user profile
router.get('/profile', authController.getProfile);

module.exports = router;