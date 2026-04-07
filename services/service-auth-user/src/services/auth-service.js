const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('../config');
const userRepository = require('../repositories/user-repository');
const HttpError = require('../utils/http-error');

function toPublicUser(user, settings) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    settings: {
      userId: settings.userId,
      defaultCurrency: settings.defaultCurrency,
      monthlySpendingLimit: settings.monthlySpendingLimit
    }
  };
}

function buildToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

async function register(payload) {
  if (await userRepository.findByEmail(payload.email)) {
    throw new HttpError(400, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const created = await userRepository.createUser({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash
  });

  return {
    token: buildToken(created.user),
    user: toPublicUser(created.user, created.settings)
  };
}

async function login(payload) {
  const user = await userRepository.findByEmail(payload.email);
  if (!user) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  let settings = await userRepository.findSettingsByUserId(user.id);
  if (!settings) {
    settings = await userRepository.upsertSettings(user.id, {});
  }

  return {
    token: buildToken(user),
    user: toPublicUser(user, settings)
  };
}

async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  let settings = await userRepository.findSettingsByUserId(user.id);
  if (!settings) {
    settings = await userRepository.upsertSettings(user.id, {});
  }
  return toPublicUser(user, settings);
}

async function updateCurrentUser(userId, payload) {
  const user = await userRepository.updateUser(userId, { fullName: payload.fullName });
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  let settings = await userRepository.findSettingsByUserId(user.id);
  if (!settings) {
    settings = await userRepository.upsertSettings(user.id, {});
  }
  return toPublicUser(user, settings);
}

async function updateUserSettings(userId, payload) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const currency = String(payload.defaultCurrency || 'USD').trim().toUpperCase().slice(0, 10);
  const rawLimit = Number(payload.monthlySpendingLimit);
  const monthlySpendingLimit =
    Number.isFinite(rawLimit) && rawLimit >= 0 ? rawLimit : 0;

  const settings = await userRepository.upsertSettings(userId, {
    defaultCurrency: currency || 'USD',
    monthlySpendingLimit
  });

  return toPublicUser(user, settings);
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateCurrentUser,
  updateUserSettings
};
