const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(100).required()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

const updateMeSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required()
});

const updateSettingsSchema = Joi.object({
  defaultCurrency: Joi.string().trim().min(2).max(10).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateMeSchema,
  updateSettingsSchema
};
