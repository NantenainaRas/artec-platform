const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  operator: { type: String, enum: ['yas', 'orange', 'airtel'], required: true },
  service: { type: String, required: true },
  network: { type: String, required: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  location: { type: String, required: true },
  comment: { type: String, default: '' },
  aiQualityLabel: {
    type: String,
    enum: ['bonne', 'moyenne', 'mauvaise', null],
    default: null
  },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);