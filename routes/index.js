const createRouter = require('./router');

const router = createRouter();

const testRoutes = require('./testRoutes');
const groupRoutes = require('./modules/groupsRoutes');

router.use(testRoutes);
router.use(groupRoutes);

module.exports = router;
