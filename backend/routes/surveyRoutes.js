const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/surveyController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', ctrl.createSurvey);          // PUBLIC
router.get('/', protect, ctrl.getSurveys);    // Protégé

module.exports = router;