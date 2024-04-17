const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().min(6).max(50).required()
    .email(),
  password: Joi.string().min(6).max(255).required(),
});

const updateSchema = Joi.object({
  email: Joi.string().min(6).max(50).email(),
  password: Joi.string().min(6).max(255),
}).or('email', 'password');

const validateRegisterandLoginDataTypes = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.message });
  }

  next();
};

const validateUserInfoUpdateDataTypes = (req, res, next) => {
  const { error } = updateSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.message });
  }

  next();
};
module.exports = { validateRegisterandLoginDataTypes, validateUserInfoUpdateDataTypes };
