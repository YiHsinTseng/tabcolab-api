const Joi = require('joi');

const groupSchema = Joi.object({
  group_id: Joi.string().optional(),
  sourceGroup_id: Joi.string().optional(),
  group_icon: Joi.string().optional(),
  group_title: Joi.string().optional(),
  items: Joi.array().optional(),
}).unknown();

const validateGroupDataTypes = (req, res, next) => {
  const { error } = groupSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.message });
  }

  next();
};

module.exports = { groupSchema, validateGroupDataTypes };
