const Message = require('../models/Message');

// Historique de conversation ARTEC <-> opérateur
exports.getMessages = async (req, res) => {
  try {
    const { operator } = req.query;
    let filter = {};

    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      // L'opérateur voit tous ses messages
      filter.$or = [
        { operatorTarget: req.user.operatorName },
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ];
    } else if (operator) {
      // ARTEC/admin filtre par opérateur
      filter = {
        $or: [
          { operatorTarget: operator },
          { senderId: req.user._id }
        ]
      };
    }

    const messages = await Message.find(filter).sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};