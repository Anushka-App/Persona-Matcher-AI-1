/**
 * Personality quiz and analysis API routes
 */
const express = require('express');
const personalityController = require('../controllers/personalityController');

const router = express.Router();

// Get personality quiz questions
router.get('/quiz', personalityController.getQuizQuestions);

// Submit personality quiz answers
router.post('/quiz/submit', personalityController.submitQuizAnswers);

// Get personality report
router.get('/report/:userId', personalityController.getPersonalityReport);

// Get artwork personality match
router.post('/artwork-match', personalityController.getArtworkPersonalityMatch);

// Save personality report
router.post('/save-report', personalityController.savePersonalityReport);

// Get personality reports
router.get('/reports', personalityController.getPersonalityReports);

// Enhanced personality quiz
router.get('/enhanced-personality-quiz/questions', personalityController.getEnhancedQuizQuestions);
router.post('/enhanced-personality-quiz', personalityController.submitEnhancedQuiz);

// Generate personality report
router.post('/generate-report', personalityController.generatePersonalityReport);

module.exports = router;
