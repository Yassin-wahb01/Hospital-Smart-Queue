const { randomUUID } = require('crypto');
const User = require('../models/User');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');

// Cookie config shared by login + refresh.
// No `domain` attribute — defaults to exact request host, which is correct for
// localhost dev, every Vercel preview URL, and production without any changes.
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

function setTokenCookies(res, accessToken, refreshToken) {
  res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearTokenCookies(res) {
  res.clearCookie('accessToken', COOKIE_OPTS);
  res.clearCookie('refreshToken', COOKIE_OPTS);
}

async function login(email, password, res) {
  const user = await User.findOne({ email, isActive: true });
  if (!user || !(await user.comparePassword(password))) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const refreshTokenId = randomUUID();
  user.refreshTokenId = refreshTokenId;
  await user.save();

  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh({ ...payload, refreshTokenId });
  setTokenCookies(res, accessToken, refreshToken);

  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

async function refresh(incomingRefreshToken, res) {
  let decoded;
  try {
    decoded = verifyRefresh(incomingRefreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.status = 401;
    throw err;
  }

  const user = await User.findOne({ _id: decoded.userId, isActive: true });
  if (!user || user.refreshTokenId !== decoded.refreshTokenId) {
    const err = new Error('Refresh token revoked');
    err.status = 401;
    throw err;
  }

  const newRefreshTokenId = randomUUID();
  user.refreshTokenId = newRefreshTokenId;
  await user.save();

  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh({ ...payload, refreshTokenId: newRefreshTokenId });
  setTokenCookies(res, accessToken, refreshToken);

  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

async function register(data, res) {
  const email = data.email;
  const existing = await User.findOne({ email, isActive: true });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 400;
    throw err;
  }

  const user = new User({
    email: data.email,
    passwordHash: data.password, // Mongoose pre-save hook hashes this
    name: data.name,
    phone: data.phone || null,
    role: 'patient',
  });
  await user.save();

  const refreshTokenId = randomUUID();
  user.refreshTokenId = refreshTokenId;
  await user.save();

  const payload = { userId: user._id, role: user.role };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh({ ...payload, refreshTokenId });
  setTokenCookies(res, accessToken, refreshToken);

  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

async function logout(userId, res) {
  await User.updateOne({ _id: userId }, { refreshTokenId: null });
  clearTokenCookies(res);
}

module.exports = { login, refresh, logout, register };
