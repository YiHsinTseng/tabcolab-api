const createRouter = require('./router');

const router = createRouter();

const groupRoutes = require('./modules/groupsRoutes');

router.use(groupRoutes);

module.exports = router;
