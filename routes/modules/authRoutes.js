const router = require('express').Router();
const passport = require('passport');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);

router.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
  req.session.googleToken = req.user.token; // 將 Google token 存到 session
  res.redirect('http://localhost:4000/oauthLogin.html');
});

router.get('/google/token', (req, res) => {
  if (req.session.googleToken) {
    res.json({ token: req.session.googleToken }); // 將 Google token 以 JSON 格式回傳
  } else {
    res.status(401).json({ error: '未授權' });
  }
});

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);

router.get('/github/redirect', passport.authenticate('github', { session: false }), (req, res) => {
  req.session.githubToken = req.user.token; // 將 GitHub token 存到 session
  res.redirect('http://localhost:4000/oauthLogin.html');
});

router.get('/github/token', (req, res) => {
  if (req.session.githubToken) {
    res.json({ token: req.session.githubToken }); // 將 GitHub token 以 JSON 格式回傳
  } else {
    res.status(401).json({ error: '未授權' });
  }
});
module.exports = router;
