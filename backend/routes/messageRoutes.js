const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, ctrl.getMessages);

module.exports = router;