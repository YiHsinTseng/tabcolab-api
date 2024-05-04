const Joi = require('joi');
const { groupSchema } = require('./group');
const { itemSchema } = require('./item');
const { positionSchema } = require('./position');
const AppError = require('../utils/appError');

const validateDataTypes = (req, res, next) => {
  const schema = Joi.alternatives().try(
    groupSchema.unknown(),
    itemSchema.unknown(),
    positionSchema.unknown(),
  );

  const { error } = schema.validate(req.body);

  if (error) {
    throw new AppError(400, error.message);
  }

  next();
};

module.exports = validateDataTypes;
