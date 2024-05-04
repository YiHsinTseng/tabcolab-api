const Joi = require('joi');
const AppError = require('../utils/appError');

const positionSchema = Joi.object({
  group_pos: Joi.number().integer().optional(),
  targetItem_position: Joi.number().integer().optional(),
}).unknown();

const validatePositionDataTypes = (req, res, next) => {
  const { error } = positionSchema.validate(req.body);

  if (error) {
    throw new AppError(400, error.message);
  }

  next();
};

module.exports = { positionSchema, validatePositionDataTypes };
