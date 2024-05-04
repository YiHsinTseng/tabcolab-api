const router = require('express').Router();
const { validateRegisterandLoginDataTypes, validateUserInfoUpdateDataTypes } = require('../validations/user');
const controller = require('../controllers/user');
const { authenticateJwt, authenticateAdmin } = require('../middlewares/authenticate');

// local auth
router.post('/users/register', validateRegisterandLoginDataTypes, controller.register);
router.post('/users/login', validateRegisterandLoginDataTypes, controller.login);

// JWT authentication middleware
router.use(authenticateJwt);

router.get('/users', authenticateAdmin, controller.getAllUsers);
router.get('/user', controller.getUserInfo);
router.patch('/user', validateUserInfoUpdateDataTypes, controller.updateUserInfo);
router.delete('/user', controller.deleteUser);

module.exports = router;
