const { Router } = require('express');
const authenticate = require('../middleware/authenticate');
const { loginRules, registerRules, validate, login, register, refreshToken, logout, me } = require('../controllers/authController');

const router = Router();

router.post('/login', loginRules, validate, login);
router.post('/register', registerRules, validate, register);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
