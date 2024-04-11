const router = require('express').Router();
const { validateRegisterandLoginDataTypes, validateUserInfoUpdateDataTypes } = require('../../validations/validation-user');
const controller = require('../../controllers/userController');
const { authenticateJwt, requireAdmin } = require('../../middlewares/authenticate');

router.post('/users/register', validateRegisterandLoginDataTypes, controller.register);
router.post('/users/login', validateRegisterandLoginDataTypes, controller.login);

router.use(authenticateJwt);

router.get('/users', requireAdmin, controller.getAllUsers);
router.get('/user', controller.getUserInfo);
router.patch('/user', validateUserInfoUpdateDataTypes, controller.updateUserInfo);
router.delete('/user', controller.deleteUser);

module.exports = router;
