/**
 * User API routes
 */
const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Register new user
router.post('/register', userController.register);

// Login user
router.post('/login', userController.login);

// Get user profile
router.post('/profile', userController.getUserProfile);
router.get('/profile/:userId', userController.getUserProfile);

// Update user profile
router.put('/profile/:userId', userController.updateUserProfile);

// Get user preferences
router.get('/preferences/:userId', userController.getUserPreferences);

// Update user preferences
router.put('/preferences/:userId', userController.updateUserPreferences);
router.post('/update-preferences', userController.updateUserPreferences);

// Check if user exists
router.get('/check-exists/:userCookieId', userController.checkUserExists);

// Check user authentication
router.get('/check-auth/:userCookieId', userController.checkUserAuth);

// Get all users (admin)
router.get('/all-users', userController.getAllUsers);

// Delete user (admin)
router.delete('/delete/:userId', userController.deleteUser);

// Get user personality report
router.post('/personality-report', userController.getUserPersonalityReport);

module.exports = router;
