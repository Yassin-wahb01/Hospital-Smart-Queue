const { body, param, query, validationResult } = require('express-validator');
const apptService = require('../services/appointmentService');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

const createRules = [
  body('doctorId').isMongoId(),
  body('departmentId').isMongoId(),
  body('dateTime').isISO8601().toDate(),
];

const updateRules = [
  param('id').isMongoId(),
  body('status').isIn(['scheduled', 'attended', 'no-show', 'cancelled']),
];

const listRules = [
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
];

async function list(req, res, next) {
  try {
    // Doctors only see their own appointments
    const scope = req.user.role === 'doctor' ? { doctorId: req.user.userId } : {};
    const result = await apptService.listAppointments({ ...scope, ...req.query });
    res.json(result);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const appt = await apptService.createAppointment(req.body);
    res.status(201).json(appt);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const appt = await apptService.updateStatus(req.params.id, req.body.status);
    res.json(appt);
  } catch (err) { next(err); }
}

module.exports = { createRules, updateRules, listRules, validate, list, create, updateStatus };
