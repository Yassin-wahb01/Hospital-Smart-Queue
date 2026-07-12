const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const {
  createRules, reassignRules,
  validate, list, create, reassignHead, remove,
} = require('../controllers/departmentController');

const router = Router();

router.use(authenticate);

router.get('/',                        list);
router.post('/',    authorize(['admin']), createRules,   validate, create);
router.put('/:id/reassign-head',       authorize(['admin']), reassignRules, validate, reassignHead);
router.delete('/:id', authorize(['admin']), remove);

module.exports = router;
