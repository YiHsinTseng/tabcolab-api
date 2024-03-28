const router = require('express').Router();
const { validateRegisterandLoginDataTypes, validateUserInfoUpdateDataTypes } = require('../../validations/validation-user');
const controller = require('../../controllers/userController');

// TODO:
router.get('/user', controller.getAllUsers);
router.get('/user/:user_id', controller.getUserInfo);
router.post('/user/register', validateRegisterandLoginDataTypes, controller.register);
router.post('/user/login', validateRegisterandLoginDataTypes, controller.login);
router.patch('/user/:user_id', validateUserInfoUpdateDataTypes, controller.updateUserInfo);

module.exports = router;
