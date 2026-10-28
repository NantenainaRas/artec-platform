const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, ctrl.getAlerts);
router.put('/:id/read', protect, ctrl.markRead);

module.exports = router;