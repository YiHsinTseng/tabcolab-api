const router = require('express').Router();

const controller = require('../../controllers/userController');

router.post('/user/register', controller.register);
router.post('/user/login', controller.login);

module.exports = router;
