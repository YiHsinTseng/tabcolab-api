const createRouter = require('../router');

const router = createRouter();
const controller = require('../../controllers/groupController');

router.get('/groups', controller.getGroups);
router.post('/groups', controller.createGroupWithSidebarTab);

module.exports = router;
