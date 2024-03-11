const createRouter = require('../router');

const router = createRouter();
const controller = require('../../controllers/groupController');

router.get('/groups', controller.getGroups);
router.post('/groups', controller.createGroup);
router.patch('/groups/:group_id', controller.updateGroup);
router.delete('/groups/:group_id', controller.deleteGroup);

module.exports = router;

/**
 * @openapi
 * paths:
 *   /groups:
 *     get:
 *       tags:
 *         - Groups
 *       summary: Display all groups and their items in workspace
 *       description: Display all groups and their items in workspace.
 */

/**
 * @openapi
 * paths:
 *   /groups:
 *     post:
 *       tags:
 *         - Groups
 *       summary: Create a new group in workspace
 *       description: 'Create a new group in the workspace. <br> It includes three scenarios: <br> 1. Create Group at Blank Space; <br> 2. Create Group by Dragging a Tab From Sidebar to Blank Space;<br> 3. Create Group by Dragging a Tab From a Group to Blank Space. '
 *       requestBody:
 *         $ref: '#/components/requestBodies/CreateGroup'
 */

/**
 * @openapi
 * paths:
 *   /groups/{group_id}:
 *     patch:
 *       tags:
 *         - Groups
 *       summary: Modify group info or status
 *       description: Modify group information or status:<br> 1. Modify group icon, group title <br>2. Changing group position
 *       parameters:
 *         - $ref: '#/parameters/groupIdParamforUpdateGroup'
 *       requestBody:
 *         $ref: '#/components/requestBodies/UpdateGroup'
 */

/**
 * @openapi
 * paths:
 *   /groups/{group_id}:
 *     delete:
 *       tags:
 *         - Groups
 *       summary: Delete groups (including their tabs)
 *       description: Delete groups (including their tabs).
 *       parameters:
 *         - $ref: '#/parameters/groupIdParamforDeleteGroup'
 */
