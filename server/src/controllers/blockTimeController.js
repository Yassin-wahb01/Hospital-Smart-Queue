const { body, param, validationResult } = require('express-validator');
const blockTimeService = require('../services/blockTimeService');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const createRules = [
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date (YYYY-MM-DD)'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required'),
];

const deleteRules = [
  param('id').isMongoId().withMessage('Invalid block ID'),
];

async function list(req, res, next) {
  try {
    const blocks = await blockTimeService.listBlocks(req.user.userId);
    res.json(blocks);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const block = await blockTimeService.createBlock({
      doctorId: req.user.userId,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      reason: req.body.reason,
    });
    res.status(201).json(block);
  } catch (err) {
    next(err);
  }
}

async function deleteBlock(req, res, next) {
  try {
    await blockTimeService.deleteBlock(req.params.id, req.user.userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRules,
  deleteRules,
  validate,
  list,
  create,
  deleteBlock,
};
