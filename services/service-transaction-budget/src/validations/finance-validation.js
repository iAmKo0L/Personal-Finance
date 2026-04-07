const Joi = require('joi');

const monthPattern = /^\d{4}-\d{2}$/;

const transactionSchema = Joi.object({
  type: Joi.string().valid('income', 'expense').required(),
  amount: Joi.number().positive().required(),
  categoryId: Joi.string().required(),
  note: Joi.string().allow('').max(255),
  transactionDate: Joi.date().iso().required()
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  type: Joi.string().valid('income', 'expense').required()
});

const budgetSchema = Joi.object({
  month: Joi.string().pattern(monthPattern).required(),
  categoryId: Joi.string().allow(null, ''),
  limitAmount: Joi.number().positive().required(),
  alertThreshold: Joi.number().min(1).max(100).required()
});

const listTransactionsQuerySchema = Joi.object({
  month: Joi.string().pattern(monthPattern),
  type: Joi.string().valid('income', 'expense'),
  categoryId: Joi.string()
});

const monthQuerySchema = Joi.object({
  month: Joi.string().pattern(monthPattern).required()
});

module.exports = {
  transactionSchema,
  categorySchema,
  budgetSchema,
  listTransactionsQuerySchema,
  monthQuerySchema,
  monthPattern
};
