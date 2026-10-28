const Survey = require('../models/Survey');

// POST /api/surveys (public)
exports.createSurvey = async (req, res) => {
  try {
    const { operator, service, network, score, location, comment } = req.body;
    if (!operator || !service || !network || !score || !location) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    if (score < 1 || score > 10) {
      return res.status(400).json({ message: 'Score entre 1 et 10' });
    }

    const survey = await Survey.create({
      operator,
      service,
      network,
      score,
      location,
      comment: comment || '',
      aiQualityLabel: null // ← Sera rempli plus tard quand l'IA sera ajoutée
    });

    // Vérification automatique d'alerte
    await checkAndCreateAlertForOperator(operator, req.app.get('io'));

    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/surveys
exports.getSurveys = async (req, res) => {
  try {
    let filter = {};
    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      filter.operator = req.user.operatorName;
    }
    const surveys = await Survey.find(filter).sort({ submittedAt: -1 });
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction utilitaire : créer une alerte si score moyen < 5 avec >= 5 sondages
async function checkAndCreateAlertForOperator(operator, io) {
  try {
    const Alert = require('../models/Alert');
    const agg = await Survey.aggregate([
      { $match: { operator } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    if (agg.length && agg[0].avg < 5 && agg[0].count >= 5) {
      const existing = await Alert.findOne({
        operator,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      if (!existing) {
        const alert = await Alert.create({
          operator,
          message: `Qualité faible : score moyen ${agg[0].avg.toFixed(1)}/10 sur ${agg[0].count} sondages.`,
          averageScore: agg[0].avg
        });
        if (io) io.emit(`alert_${operator}`, alert);
      }
    }
  } catch (e) {
    console.error('Erreur vérification alerte:', e.message);
  }
}