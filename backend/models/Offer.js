const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  operator: { type: String, enum: ['yas', 'orange', 'airtel'], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  dataVolume: { type: String, default: '' },
  validity: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);