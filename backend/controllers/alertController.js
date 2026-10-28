const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    let filter = {};
    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      filter.operator = req.user.operatorName;
    }
    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};