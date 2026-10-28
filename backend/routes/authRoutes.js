const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/login', ctrl.login);
router.get('/me', protect, ctrl.me);

// Seul l'admin peut créer/gérer des comptes
router.post('/register', protect, authorize('admin'), ctrl.register);
router.get('/users', protect, authorize('admin'), ctrl.listUsers);
router.put('/users/:id', protect, authorize('admin'), ctrl.updateUser);
router.delete('/users/:id', protect, authorize('admin'), ctrl.deleteUser);

module.exports = router;