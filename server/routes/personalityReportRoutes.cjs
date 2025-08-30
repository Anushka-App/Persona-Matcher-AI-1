"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personalityReportController_1 = require("../controllers/personalityReportController");
const router = (0, express_1.Router)();
const personalityReportController = new personalityReportController_1.PersonalityReportController();
router.post('/generate', async (req, res) => {
    await personalityReportController.generateReport(req, res);
});
router.post('/generate-from-quiz', async (req, res) => {
    await personalityReportController.generateReportFromQuiz(req, res);
});
router.get('/template', async (req, res) => {
    await personalityReportController.getReportTemplate(req, res);
});
exports.default = router;
