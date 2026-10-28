const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/offerController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/', protect, ctrl.getOffers);
router.post('/', protect, authorize('yas', 'orange', 'airtel', 'artec', 'admin'), ctrl.createOffer);
router.put('/:id', protect, authorize('yas', 'orange', 'airtel', 'artec', 'admin'), ctrl.updateOffer);
router.delete('/:id', protect, authorize('yas', 'orange', 'airtel', 'artec', 'admin'), ctrl.deleteOffer);

module.exports = router;