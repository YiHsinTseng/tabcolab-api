const router = require('express').Router();
const { validateRegisterandLoginDataTypes, validateUserInfoUpdateDataTypes } = require('../../validations/validation-user');
const controller = require('../../controllers/userController');
const authenticateJwt = require('../../middlewares/authenticate');
// TODO:
router.get('/user', authenticateJwt, controller.getAllUsers);
router.get('/user/:user_id', authenticateJwt, controller.getUserInfo);
router.post('/user/register', validateRegisterandLoginDataTypes, controller.register);
router.post('/user/login', validateRegisterandLoginDataTypes, controller.login);
router.patch('/user/:user_id', authenticateJwt, validateUserInfoUpdateDataTypes, controller.updateUserInfo);
router.delete('/user/:user_id', authenticateJwt, controller.deleteUser);

module.exports = router;
