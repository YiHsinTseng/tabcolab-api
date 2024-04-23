const router = require('express').Router();
const passport = require('passport');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  }),
);

router.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
  res.cookie('jwt', req.user.token, {
    httpOnly: false, // 防止 JavaScript 讀取此 cookie
    secure: false, // 只在 HTTPS 連線中傳送此 cookie
    sameSite: 'strict', // 防止 CSRF 攻擊
  });
  res.redirect('http://localhost:4000/oauthLogin.html');
});

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  }),
);

router.get('/github/redirect', passport.authenticate('github', { session: false }), (req, res) => {
  res.cookie('jwt', req.user.token, {
    httpOnly: false, // 防止 JavaScript 讀取此 cookie
    secure: false, // 只在 HTTPS 連線中傳送此 cookie
    sameSite: 'strict', // 防止 CSRF 攻擊
  });
  res.redirect('http://localhost:4000/oauthLogin.html');
});

module.exports = router;
