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

module.exports = router;
