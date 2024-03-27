const router = require('express').Router();

const { register, login } = require('../../controllers/userController');
const loginValidation = require('../../validation');

router.use((req, res, next) => {
  console.log('正在接收一個跟auth有關的請求');
  next();
});

router.get('/testAPI', (req, res) => res.send('成功連結auth route...'));

router.post('/register', registerValidation, register);

router.post('/login', loginValidation, login);

module.exports = router;
