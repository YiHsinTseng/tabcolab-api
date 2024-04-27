require('dotenv').config();
const router = require('express').Router();
const passport = require('passport');
const controller = require('../../controllers/oauthController');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);

router.get('/google/redirect', passport.authenticate('google', { session: false }), async (req, res, next) => {
  try {
    req.session.googleToken = req.user.token; // 將 Google token 存到 session
    res.redirect('https://tabcolab.live/oauthLogin.html');
  } catch (error) {
    next(error);
  }
});

router.get('/google/token', async (req, res, next) => {
  try {
    if (req.session.googleToken) {
      res.json({ token: req.session.googleToken }); // 將 Google token 以 JSON 格式回傳
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    next(error);
  }
});

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  }),
);

router.get('/github/redirect', passport.authenticate('github', { session: false }), async (req, res, next) => {
  try {
    req.session.githubToken = req.user.token; // 將 GitHub token 存到 session
    res.redirect('https://tabcolab.live/oauthLogin.html');
  } catch (error) {
    next(error);
  }
});

router.get('/github/token', async (req, res, next) => {
  try {
    if (req.session.githubToken) {
      res.json({ token: req.session.githubToken }); // 將 GitHub token 以 JSON 格式回傳
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/google/token', controller.googleOauth);

module.exports = router;
