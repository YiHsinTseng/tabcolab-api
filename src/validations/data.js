const Joi = require('joi');
const { groupSchema } = require('./group');
const { itemSchema } = require('./item');
const { positionSchema } = require('./position');

const validateDataTypes = (req, res, next) => {
  const schema = Joi.alternatives().try(
    groupSchema.unknown(),
    itemSchema.unknown(),
    positionSchema.unknown(),
  );

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.message });
  }

  next();
};

module.exports = validateDataTypes;
