const router = require('express').Router();

const groupRoutes = require('./modules/groupsRoutes');
const userRoutes = require('./modules/userRoutes');

router.use(groupRoutes);
router.use(userRoutes);

module.exports = router;
