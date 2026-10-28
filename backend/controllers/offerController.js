const Offer = require('../models/Offer');

exports.createOffer = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user._id };
    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      payload.operator = req.user.operatorName;
    }
    const offer = await Offer.create(payload);
    res.status(201).json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOffers = async (req, res) => {
  try {
    let filter = {};
    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      filter.operator = req.user.operatorName;
    }
    const offers = await Offer.find(filter).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });

    if (
      ['yas', 'orange', 'airtel'].includes(req.user.role) &&
      offer.operator !== req.user.operatorName
    ) {
      return res.status(403).json({ message: 'Non autorisé sur cette offre' });
    }
    Object.assign(offer, req.body);
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offre supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};