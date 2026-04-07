const service = require('../services/auth-service');
const schemas = require('../validations/auth-validation');

function validate(schema, payload) {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    convert: true,
    stripUnknown: true
  });
  if (error) {
    error.status = 400;
    error.details = error.details.map((detail) => detail.message);
    throw error;
  }
  return value;
}

async function register(req, res, next) {
  try {
    const payload = validate(schemas.registerSchema, req.body);
    const result = await service.register(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const payload = validate(schemas.loginSchema, req.body);
    const result = await service.login(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await service.getCurrentUser(req.user.sub);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const payload = validate(schemas.updateMeSchema, req.body);
    const result = await service.updateCurrentUser(req.user.sub, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const payload = validate(schemas.updateSettingsSchema, req.body);
    const result = await service.updateUserSettings(req.user.sub, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  me,
  updateMe,
  updateSettings
};
