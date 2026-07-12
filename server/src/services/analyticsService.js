const Appointment = require('../models/Appointment');

/**
 * Weekly analytics: appointments grouped by status, department, and doctor,
 * filtered to the last 7 days.
 *
 * # ponytail: in-process debounce only works single-instance;
 * move to Redis pub/sub + Change Streams when you run >1 Node process
 */
async function getWeeklyAnalytics() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [byStatus, byDepartment, byDoctor, totals] = await Promise.all([
    // Breakdown by status
    Appointment.aggregate([
      { $match: { dateTime: { $gte: since }, isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Breakdown by department (top 10)
    Appointment.aggregate([
      { $match: { dateTime: { $gte: since }, isActive: true } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept',
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ['$dept.name', 0] },
          count: 1,
        },
      },
    ]),

    // Breakdown by doctor (top 10)
    Appointment.aggregate([
      { $match: { dateTime: { $gte: since }, isActive: true } },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ['$doctor.name', 0] },
          count: 1,
        },
      },
    ]),

    // Daily trend for the last 7 days
    Appointment.aggregate([
      { $match: { dateTime: { $gte: since }, isActive: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateTime' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return { byStatus, byDepartment, byDoctor, dailyTrend: totals };
}

module.exports = { getWeeklyAnalytics };
