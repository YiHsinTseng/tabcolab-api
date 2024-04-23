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
  req.session.token = req.user.token;
  res.redirect('/api/1.0/auth/google/token');
});

router.get('/google/token', (req, res) => {
  const { token } = req.session;
  return res.json({ token });
});

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  }),
);

router.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
  res.cookie('token', req.user.token, {
    httpOnly: true, // 防止 JavaScript 讀取此 cookie
    secure: true, // 只在 HTTPS 連線中傳送此 cookie
    sameSite: 'strict', // 防止 CSRF 攻擊
  });
  res.redirect('http://localhost:4000/google_login.html');
});

module.exports = router;
