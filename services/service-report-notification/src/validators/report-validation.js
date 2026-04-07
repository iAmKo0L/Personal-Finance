const Joi = require('joi');

const monthPattern = /^\d{4}-\d{2}$/;

const monthQuerySchema = Joi.object({
  month: Joi.string().pattern(monthPattern).required()
});

module.exports = {
  monthQuerySchema
};
