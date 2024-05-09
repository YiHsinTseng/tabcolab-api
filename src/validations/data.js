const Joi = require('joi');
const { groupSchema } = require('./group');
const { itemSchema } = require('./item');
const { positionSchema } = require('./position');
const AppError = require('../utils/appError');

const validateDataTypes = (req, res, next) => {
  const schemas = [groupSchema, itemSchema, positionSchema];

  for (const schema of schemas) {
    const { error } = schema.unknown().validate(req.body);
    if (error) {
      throw new AppError(400, error.message);
    }
  }

  next();
};

module.exports = validateDataTypes;
