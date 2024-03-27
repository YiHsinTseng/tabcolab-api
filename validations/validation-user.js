const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().min(6).max(50).required()
    .email(),
  password: Joi.string().min(6).max(255).required(),
});

const validateUserDataTypes = (req, res, next) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.message });
  }

  next();
};

module.exports = validateUserDataTypes;
