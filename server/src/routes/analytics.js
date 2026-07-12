const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { weekly } = require('../controllers/analyticsController');

const router = Router();

router.get('/weekly', authenticate, weekly);

module.exports = router;
