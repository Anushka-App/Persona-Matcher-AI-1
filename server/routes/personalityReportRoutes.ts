import { Router } from 'express';
import { PersonalityReportController } from '../controllers/personalityReportController';

const router = Router();
const personalityReportController = new PersonalityReportController();

/**
 * @route POST /api/personality-report/generate
 * @desc Generate a personality report from user input
 * @access Public
 */
router.post('/generate', async (req, res) => {
  await personalityReportController.generateReport(req, res);
});

/**
 * @route POST /api/personality-report/generate-from-quiz
 * @desc Generate a personality report from quiz answers
 * @access Public
 */
router.post('/generate-from-quiz', async (req, res) => {
  await personalityReportController.generateReportFromQuiz(req, res);
});

/**
 * @route GET /api/personality-report/template
 * @desc Get a template for personality report input
 * @access Public
 */
router.get('/template', async (req, res) => {
  await personalityReportController.getReportTemplate(req, res);
});

export default router;
