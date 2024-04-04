const router = require('express').Router();
const { validateRegisterandLoginDataTypes, validateUserInfoUpdateDataTypes } = require('../../validations/validation-user');
const controller = require('../../controllers/userController');
const authenticateJwt = require('../../middlewares/authenticate');
// TODO:
router.get('/users', authenticateJwt, controller.getAllUsers);
router.get('/user', authenticateJwt, controller.getUserInfo);
router.post('/users/register', validateRegisterandLoginDataTypes, controller.register);
router.post('/users/login', validateRegisterandLoginDataTypes, controller.login);
router.patch('/user', authenticateJwt, validateUserInfoUpdateDataTypes, controller.updateUserInfo);
router.delete('/user', authenticateJwt, controller.deleteUser);

module.exports = router;
