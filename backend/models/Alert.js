const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  operator: { type: String, enum: ['yas', 'orange', 'airtel'], required: true },
  type: { type: String, default: 'qualite_faible' },
  message: { type: String, required: true },
  averageScore: { type: Number },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);