const Joi = require('joi');

const positionSchema = Joi.object({
  group_pos: Joi.number().integer().optional(),
  targetItem_position: Joi.number().integer().optional(),
}).unknown();

const validatePositionDataTypes = (req, res, next) => {
  const { error } = positionSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.message });
  }

  next();
};

module.exports = { positionSchema, validatePositionDataTypes };
