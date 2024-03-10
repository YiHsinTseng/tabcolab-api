const createRouter = require('../router');

const router = createRouter();
const controller = require('../../controllers/groupController');

router.get('/groups', controller.getGroups);
router.post('/groups', controller.createGroup);
router.patch('/groups/:group_id', controller.updateGroup);
router.delete('/groups/:group_id', controller.deleteGroup);
module.exports = router;
