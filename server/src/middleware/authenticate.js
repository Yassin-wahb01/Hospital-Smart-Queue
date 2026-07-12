const { verifyAccess } = require('../utils/jwt');
const User = require('../models/User');

async function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = verifyAccess(token);
    // Attach only what we need — avoids leaking hash etc.
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticate;
