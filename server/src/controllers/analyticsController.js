const analyticsService = require('../services/analyticsService');

async function weekly(req, res, next) {
  try {
    const data = await analyticsService.getWeeklyAnalytics();
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = { weekly };
