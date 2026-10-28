const Survey = require('../models/Survey');

// Utilitaire : construit un $match selon la période
function buildDateMatch(period) {
  if (period === '7') return { submittedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
  if (period === '30') return { submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  return {};
}

exports.getStats = async (req, res) => {
  try {
    const period = req.query.period || 'all';
    const dateMatch = buildDateMatch(period);

    const matchStage = { ...dateMatch };
    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      matchStage.operator = req.user.operatorName;
    }

    // Résumé global
    const summary = await Survey.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          total: { $sum: 1 },
          bonne: { $sum: { $cond: [{ $eq: ['$aiQualityLabel', 'bonne'] }, 1, 0] } },
          moyenne: { $sum: { $cond: [{ $eq: ['$aiQualityLabel', 'moyenne'] }, 1, 0] } },
          mauvaise: { $sum: { $cond: [{ $eq: ['$aiQualityLabel', 'mauvaise'] }, 1, 0] } }
        }
      }
    ]);

    // Par opérateur
    const byOperator = await Survey.aggregate([
      { $match: dateMatch },
      { $group: { _id: '$operator', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
      { $sort: { avgScore: -1 } }
    ]);

    // Par service (avec filtre opérateur)
    const byService = await Survey.aggregate([
      { $match: matchStage },
      { $group: { _id: '$service', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Par réseau
    const byNetwork = await Survey.aggregate([
      { $match: matchStage },
      { $group: { _id: '$network', avgScore: { $avg: '$score' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Timeline
    const daysBack = period === '7' ? 7 : period === '30' ? 30 : 7;
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    const timeline = await Survey.aggregate([
      { $match: { ...matchStage, submittedAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          avgScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Derniers sondages (5 pour l'aperçu)
    const latestMatch = {};
    if (['yas', 'orange', 'airtel'].includes(req.user.role)) {
      latestMatch.operator = req.user.operatorName;
    }
    const latestSurveys = await Survey.find(latestMatch)
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('operator service network score location submittedAt');

    res.json({
      summary: summary[0] || { avgScore: 0, total: 0, bonne: 0, moyenne: 0, mauvaise: 0 },
      byOperator,
      byService,
      byNetwork,
      timeline,
      latestSurveys,
      period
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};