const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { loginRules, validate, login, refreshToken, logout, me } = require('../controllers/authController');

const router = Router();

router.post('/login', loginRules, validate, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
