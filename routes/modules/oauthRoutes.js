const router = require('express').Router();
const passport = require('passport');

router.get('/login', (req, res) => {
  res.render('login');
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);

router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  console.log('進入redirect區域');
  res.redirect('/profile');
});

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);

router.get('/github/redirect', passport.authenticate('github'), (req, res) => {
  console.log('進入redirect區域');
  res.redirect('/profile');
});

module.exports = router;
