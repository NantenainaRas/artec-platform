const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderUsername: { type: String },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  operatorTarget: { type: String, enum: ['yas', 'orange', 'airtel', null], default: null },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);