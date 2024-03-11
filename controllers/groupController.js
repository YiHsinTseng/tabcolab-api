const env = process.env.NODE_ENV || 'development';

const config = require('../configs/config.json');
const AppError = require('../utils/appError');

const Group = require(`${config[env].db.modelpath}/group`);

const { Tab } = require(`${config[env].db.modelpath}/item`);

const ErrorResponse = (statusCode, message, res) => {
  const status = statusCode === 500 ? 'error' : 'fail';
  res.status(statusCode).json({ status, message });
};

const getGroups = async (req, res, next) => {
  try {
    const result = await Group.getAll();

    if (result.success) {
      res.status(200).json({
        message: result.message,
        groups: result.groups,
      });
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    next(error);
  }
};

const createGroupWithSidebarTab = async (req, res) => {
  const {
    group_icon,
    group_title,
    browserTab_favIconURL,
    browserTab_title,
    browserTab_url,
  } = req.body;

  if (!group_icon || !group_title || !browserTab_favIconURL || !browserTab_title || !browserTab_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTab = new Tab(browserTab_favIconURL, browserTab_title, browserTab_url);
    const newGroup = new Group(group_icon, group_title, [newTab]);

    const result = await newGroup.createGroup();
    if (result.success) {
      return res.status(201).json({ message: result.message, group: newGroup });
    }
    return res.status(500).json({ error: result.error, details: result.details });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the group', details: error.message });
  }
};

const createGroupWithGroupTab = async (req, res) => {
  try {
    const {
      sourceGroup_id, group_icon, group_title, item_id,
    } = req.body;

    if (!sourceGroup_id || !group_icon || !group_title || !item_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const sourceGroup = await Group.findById(sourceGroup_id);
    if (!sourceGroup) {
      return res.status(404).json({ error: 'Source group not found' });
    }

    if (!sourceGroup.items) {
      return res.status(500).json({ error: 'Source group does not contain items' });
    }

    const itemIndex = sourceGroup.items.findIndex((item) => item.item_id === item_id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in source group' });
    }

    const item = sourceGroup.items[itemIndex];

    const newGroup = new Group(group_icon, group_title, [item]);

    const result = await newGroup.createGroup();
    if (result.success) {
      // Remove the item from the source group and update the source group
      sourceGroup.items.splice(itemIndex, 1);
      await Group.updateGroup(sourceGroup);

      return res.status(201).json({ message: 'Group created with tab from other group successfully', group: newGroup });
    }
    return res.status(500).json({ error: result.error, details: result.details });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the group', details: error.message });
  }
};

const createGroup = (req, res) => {
  const {
    group_icon,
    group_title,
    browserTab_favIconURL,
    browserTab_title,
    browserTab_url,
    sourceGroup_id,
    item_id,
  } = req.body;

  const keys = Object.keys(req.body);
  const validKeysForSidebarTab = ['group_icon', 'group_title', 'browserTab_favIconURL', 'browserTab_title', 'browserTab_url'];
  const validKeysForGroupTab = ['sourceGroup_id', 'group_icon', 'group_title', 'item_id'];

  if (
    group_icon
    && group_title
    && browserTab_favIconURL
    && browserTab_title
    && browserTab_url
    && keys.every((key) => validKeysForSidebarTab.includes(key))
  ) {
    createGroupWithSidebarTab(req, res);
  } else if (
    sourceGroup_id
    && group_icon
    && group_title
    && item_id
    && keys.every((key) => validKeysForGroupTab.includes(key))
  ) {
    createGroupWithGroupTab(req, res);
  } else {
    return res.status(400).json({ error: 'Invalid request body' });
  }
};

const updateGroup = async (req, res) => {
  const { group_id } = req.params;

  const group = await Group.findById(group_id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  const { group_icon, group_title, group_pos } = req.body;

  // Check that only one of group_icon, group_title, or group_pos is present
  const numProps = [group_icon, group_title, group_pos].filter((prop) => prop !== undefined).length;
  if (numProps !== 1) {
    return res.status(400).json({ error: 'Invalid request body, only one of group_icon, group_title, or group_pos should be present' });
  }

  if (group_id && group_icon) {
    group.group_icon = group_icon;
    await Group.updateGroup(group);
    return res.status(200).json({ message: 'Group icon updated successfully' });
  }

  if (group_id && group_title) {
    group.group_title = group_title;
    await Group.updateGroup(group);
    return res.status(200).json({ message: 'Group title updated successfully' });
  }

  if (group_id && group_pos !== undefined) {
    const result = await Group.changePosition(group_id, group_pos);
    if (result.success) {
      return res.status(200).json({ message: result.message });
    }
  }
  return res.status(400).json({ error: 'Invalid request body' });
};

const deleteGroup = async (req, res) => {
  const { group_id } = req.params;
  const group = await Group.findById(group_id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const result = await Group.deleteGroup(group_id);
  if (result.success) {
    return res.status(200).json({ message: result.message });
  }
  return res.status(400).json({ error: result.error });
};

module.exports = {
  getGroups, createGroup, updateGroup, deleteGroup,
};

// Swagger - getGroups
/**
 * @openapi
 * components:
 *   requestBodies:
 *     CreateGroup:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/requestBodies/GroupCreateatBlank'
 *               - $ref: '#/components/requestBodies/GroupCreatewithSidebarTabatBlank'
 *               - $ref: '#/components/requestBodies/GroupCreatewithGroupTabtoBlank'
 *           examples:
 *             GroupCreateatBlank:
 *               summary: Group Create at Blank
 *               value:
 *                 group_icon: https://example.com/group_icon1.png
 *                 group_title: Group 1
 *             GroupCreatewithSidebarTabatBlank:
 *               summary: Group Create with SidebarTab at Blank
 *               value:
 *                 browserTab_favIconURL: https://example.com/favicon.png
 *                 browserTab_title: Example Tab Title
 *                 browserTab_url: https://example.com
 *                 group_icon: https://example.com/group_icon2.png
 *                 group_title: Group 2
 *                 browserTab_id: 133
 *                 browserTab_index: 15
 *                 browserTab_active: false
 *                 browserTab_status: "complete"
 *                 windowId: 3850513484
 *             GroupCreatewithGroupTabtoBlank:
 *               summary: Group Create with Group Tab to Blank
 *               value:
 *                 sourceGroup_id: '1'
 *                 item_id: '1'
 *     GroupCreatewithSidebarTabatBlank:
 *       description: Create Group by Dragging a Tab From Sidebar to Blank Space.
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/ChromeTabInfo'
 *         - group_icon:
 *             $ref: '#/components/schemas/Group/properties/group_icon'
 *         - group_title:
 *             $ref: '#/components/schemas/Group/properties/group_title'
 *     GroupCreateatBlank:
 *       description: Create Group at Blank Space.
 *       type: object
 *       properties:
 *         group_icon:
 *           $ref: '#/components/schemas/Group/properties/group_icon'
 *         group_title:
 *           $ref: '#/components/schemas/Group/properties/group_title'
 *     GroupCreatewithGroupTabtoBlank:
 *       description: Create Group by Dragging a Tab From a Group to Blank Space.
 *       type: object
 *       properties:
 *         sourceGroup_id:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 *         item_id:
 *           $ref: '#/components/schemas/Item/properties/item_id'
 */
/**
 * @openapi
 * paths:
 *   /groups:
 *     get:
 *       responses:
 *         '200':
 *           $ref: '#/components/responses/getGroups200'
 *         '404':
 *           $ref: '#/components/responses/getGroups404'
 */
/**
 * @openapi
 * components:
 *   responses:
 *     getGroups200:
 *       description: Success
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Group'
 *       example:
 *         groups:
 *           - id: '1'
 *             group_icon: group_icon_url
 *             group_title: Group 1
 *             items:
 *               - item_id: '1'
 *                 item_type: 0
 *                 browserTab_favIconURL: http://favicon_url.ico
 *                 browserTab_title: Tab Title
 *                 browserTab_url: http://tab_url.com
 *                 note_content: ''
 *                 note_bgColor: '#ffffff'
 *                 browserTab_id: 123
 *                 browserTab_index: 12
 *                 browserTab_active: false
 *                 browserTab_status: "complete"
 *                 windowId: 1348438505
 *               - item_id: '2'
 *                 item_type: 1
 *                 note_content: Note content
 *                 note_bgColor: '#ffffff'
 *               - item_id: '3'
 *                 item_type: 2
 *                 doneStatus: false
 *     getGroups404:
 *       description: No group in workspace
 *       content:
 *         application/json:
 *           example:
 *             status: error
 *             message: No group in workspace
 */

// Swagger - createGroup
/**
 * @openapi
 * paths:
 *   /groups:
 *     post:
 *       responses:
 *         '201':
 *           $ref: '#/components/responses/CreateGroupResponses'
 *         '400':
 *           description: Bad Request
 */

/**
 * @openapi
 * components:
 *   responses:
 *     CreateGroupResponses:
 *       description: Group created successfully
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/responses/GroupatBlankCreatedResponse'
 *               - $ref: '#/components/responses/GroupwithSidebarTabCreatedResponse'
 *               - $ref: '#/components/responses/GroupwithGroupTabCreatedResponse'
 *     GroupwithSidebarTabCreatedResponse:
 *       description: Group created with tab from sidebar successfully
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           value: Sidebar group created successfully
 *         group_id:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 *         item_id:
 *           $ref: '#/components/schemas/Item/properties/item_id'
 *     GroupatBlankCreatedResponse:
 *       description: Group created with tab from other group successfully
 *       type: object
 *       properties:
 *         group_id:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 *     GroupwithGroupTabCreatedResponse:
 *       description: group created at blank space successfully
 *       type: object
 *       properties:
 *         group_id:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 */

// Swagger - updateGroup
/**
 * @openapi
 * parameters:
 *   groupIdParamforUpdateGroup:
 *     name: group_id
 *     in: path
 *     description: Group ID
 *     required: true
 *     schema:
 *       $ref: '#/components/schemas/Group/properties/group_id'
 *     example: 1
 */

/**
 * @openapi
 * components:
 *   requestBodies:
 *     UpdateGroup:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/requestBodies/GroupUpdate'
 *               - $ref: '#/components/requestBodies/GroupChangePos'
 *           examples:
 *             GroupUpdateIconExample:
 *               summary: Modifying group information (Icon)
 *               value:
 *                 group_icon: https://example.com/updated_icon.png
 *             GroupUpdateTitleExample:
 *               summary: Modifying group information (Title)
 *               value:
 *                 group_title: Updated Group Title
 *             GroupChangePosExample:
 *               summary: Changing group position
 *               value:
 *                 group_pos: 1
 *     GroupUpdate:
 *       description: Modify group info.
 *       type: object
 *       oneOf:
 *         group_icon:
 *           $ref: '#/components/schemas/Group/properties/group_icon'
 *         group_title:
 *           $ref: '#/components/schemas/Group/properties/group_title'
 *     GroupChangePos:
 *       description: Change group position.
 *       type: object
 *       properties:
 *         group_pos:
 *           type: integer
 *           minimum: 0
 */

/**
 * @openapi
 * paths:
 *   /groups/{group_id}:
 *     patch:
 *       responses:
 *         '200':
 *           description: Success
 *         '400':
 *           description: Bad Request
 *         '404':
 *           description: Not Found
 */

// Swagger - deleteGroup
/**
 * @openapi
 * parameters:
 *   groupIdParamforDeleteGroup:
 *     name: group_id
 *     in: path
 *     description: Group ID
 *     required: true
 *     schema:
 *       $ref: '#/components/schemas/Group/properties/group_id'
 *     example: 1
 */
/**
 * @openapi
 * paths:
 *   /groups/{group_id}:
 *     delete:
 *       responses:
 *         '204':
 *           description: Success
 *         '400':
 *           description: Bad Request
 *         '404':
 *           description: Not Found
 */
