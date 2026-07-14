const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createRules, deleteRules, validate, list, create, deleteBlock,
} = require('../controllers/blockTimeController');

const router = Router();

// All block-times routes require authentication and doctor-only access
router.use(authenticate);
router.use(authorize(['doctor']));

router.get('/', list);
router.post('/', createRules, validate, create);
router.delete('/:id', deleteRules, validate, deleteBlock);

module.exports = router;
