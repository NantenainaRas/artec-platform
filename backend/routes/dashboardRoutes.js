const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, ctrl.getStats);

module.exports = router;