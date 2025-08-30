/**
 * Personality controller
 */
const personalityService = require('../services/personalityService');
const personalityAnalysisService = require('../services/personalityAnalysisService');
const artworkPersonalityService = require('../services/artworkPersonalityService');

/**
 * Get personality quiz questions
 */
exports.getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await personalityService.getQuizQuestions();
    
    res.json({
      status: 'success',
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit personality quiz answers and get results
 */
exports.submitQuizAnswers = async (req, res, next) => {
  try {
    const { answers, userId } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Answers must be a non-empty array'
      });
    }
    
    // Process quiz answers and generate personality profile
    const personalityResult = await personalityService.processQuizAnswers(answers);
    
    // If user ID provided, store results
    if (userId) {
      await personalityService.savePersonalityResult(userId, personalityResult);
    }
    
    res.json({
      status: 'success',
      data: personalityResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personality report for user
 */
exports.getPersonalityReport = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Missing parameter',
        details: 'User ID is required'
      });
    }
    
    const report = await personalityService.getPersonalityReport(userId);
    
    if (!report) {
      return res.status(404).json({
        error: 'Not found',
        details: `Personality report for user "${userId}" not found`
      });
    }
    
    res.json({
      status: 'success',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get artwork personality match
 */
exports.getArtworkPersonalityMatch = async (req, res, next) => {
  try {
    const { artworkName, personalityProfile } = req.body;
    
    if (!artworkName && !personalityProfile) {
      return res.status(400).json({
        error: 'Missing parameters',
        details: 'Artwork name and personality profile are required'
      });
    }
    
    const match = await artworkPersonalityService.findPersonaForArtwork(artworkName, personalityProfile);
    
    res.json({
      status: 'success',
      data: match
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save personality report
 */
exports.savePersonalityReport = async (req, res, next) => {
  try {
    const { userId, reportData } = req.body;
    
    if (!userId || !reportData) {
      return res.status(400).json({
        error: 'Missing parameters',
        details: 'User ID and report data are required'
      });
    }
    
    const saved = await personalityService.savePersonalityResult(userId, reportData);
    
    res.json({
      status: 'success',
      data: { saved }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personality reports
 */
exports.getPersonalityReports = async (req, res, next) => {
  try {
    // For now, return empty array
    // In a real app, this would fetch from a database
    res.json({
      status: 'success',
      data: []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enhanced personality quiz questions
 */
exports.getEnhancedQuizQuestions = async (req, res, next) => {
  try {
    // For now, return mock questions
    // In a real app, this would load from a database or file
    const questions = [
      {
        id: '1',
        question: 'How do you typically approach new situations?',
        options: [
          { id: '1a', text: 'Cautiously and thoughtfully', traits: ['elegance'] },
          { id: '1b', text: 'With excitement and enthusiasm', traits: ['boldness'] },
          { id: '1c', text: 'With curiosity and creativity', traits: ['whimsy'] }
        ]
      },
      {
        id: '2',
        question: 'What type of social gathering do you prefer?',
        options: [
          { id: '2a', text: 'Intimate dinner parties', traits: ['elegance'] },
          { id: '2b', text: 'Large celebrations', traits: ['boldness'] },
          { id: '2c', text: 'Creative workshops', traits: ['whimsy'] }
        ]
      }
    ];
    
    res.json({
      status: 'success',
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit enhanced personality quiz
 */
exports.submitEnhancedQuiz = async (req, res, next) => {
  try {
    const { answers, userId } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Answers must be a non-empty array'
      });
    }
    
    // Process quiz answers and generate personality profile
    const personalityResult = await personalityService.processQuizAnswers(answers);
    
    // If user ID provided, store results
    if (userId) {
      await personalityService.savePersonalityResult(userId, personalityResult);
    }
    
    res.json({
      status: 'success',
      data: personalityResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate personality report
 */
exports.generatePersonalityReport = async (req, res, next) => {
  try {
    const { personalityType, dominantTraits, scores, quizJourney } = req.body;
    
    // Use the personality analysis service to generate a report
    const report = await personalityAnalysisService.generatePersonalityReport({
      personalityType,
      dominantTraits,
      scores,
      quizJourney
    });
    
    res.json({
      status: 'success',
      data: {
        report,
        personalityType,
        dominantTraits,
        scores
      }
    });
  } catch (error) {
    next(error);
  }
};
