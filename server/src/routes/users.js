const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createRules, updateRules, listRules,
  validate, list, create, update, remove,
} = require('../controllers/userController');

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/',          listRules,               validate, list);
router.post('/',         authorize(['admin']),     createRules, validate, create);
router.put('/:id',       authorize(['admin']),     updateRules, validate, update);
router.delete('/:id',    authorize(['admin']),     remove);

module.exports = router;
