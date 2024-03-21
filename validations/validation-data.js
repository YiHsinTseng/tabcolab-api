const Joi = require('joi');
const { groupSchema } = require('./validation-group');
const { itemSchema } = require('./validation-item');
const { positionSchema } = require('./validation-position');

const validateDataTypes = (req, res, next) => {
  const schema = Joi.alternatives().try(
    groupSchema.unknown(),
    itemSchema.unknown(),
    positionSchema.unknown(),
  );

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.details });
  }

  next();
};

module.exports = validateDataTypes;
