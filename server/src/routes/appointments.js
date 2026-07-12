const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createRules, updateRules, listRules,
  validate, list, create, updateStatus,
} = require('../controllers/appointmentController');

const router = Router();

router.use(authenticate);

router.get('/',     listRules, validate, list);
router.post('/',    authorize(['admin', 'receptionist']), createRules, validate, create);
router.put('/:id',  updateRules, validate, updateStatus); // doctors update own; admins update any

module.exports = router;
