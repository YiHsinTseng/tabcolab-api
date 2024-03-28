const router = require('express').Router();
const validateUserDataTypes = require('../../validations/validation-user');
const controller = require('../../controllers/userController');

// TODO:
router.get('/user', controller.getAllUsers);
router.post('/user/register', validateUserDataTypes, controller.register);
router.post('/user/login', validateUserDataTypes, controller.login);

module.exports = router;
