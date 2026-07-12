const { body, param, validationResult } = require('express-validator');
const deptService = require('../services/departmentService');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
];

const reassignRules = [
  param('id').isMongoId(),
  body('headUserId').optional({ nullable: true }).isMongoId(),
];

async function list(req, res, next) {
  try {
    const depts = await deptService.listDepartments();
    res.json(depts);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const dept = await deptService.createDepartment(req.body.name);
    res.status(201).json(dept);
  } catch (err) { next(err); }
}

async function reassignHead(req, res, next) {
  try {
    const dept = await deptService.reassignHead(req.params.id, req.body.headUserId);
    res.json(dept);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await deptService.deactivateDepartment(req.params.id);
    res.json({ message: 'Department deactivated' });
  } catch (err) {
    // Surface ACTIVE_DEPENDENCIES_EXIST detail to the frontend for the modal
    if (err.message === 'ACTIVE_DEPENDENCIES_EXIST') {
      return res.status(409).json({ error: err.message, detail: err.detail });
    }
    next(err);
  }
}

module.exports = { createRules, reassignRules, validate, list, create, reassignHead, remove };
