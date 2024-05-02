const router = require('express').Router();
const controller = require('../controllers/oauth');

router.post('/google/token', controller.googleOauth);

module.exports = router;
