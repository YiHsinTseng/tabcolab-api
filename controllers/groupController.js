const env = process.env.NODE_ENV || 'development';

const config = require('../configs/config.json');
const AppError = require('../utils/appError');

const Group = require(`${config[env].db.modelpath}/group`);
// const Group = require('../models/mock-server/group');

const ErrorResponse = (statusCode, message, res) => {
  const status = statusCode === 500 ? 'error' : 'fail';
  res.status(statusCode).json({ status, message });
};

const controller = {
  getGroups: async (req, res, next) => {
    // TODO - result 或 getGroups 來命名 yang 決定
    try {
      const getGroups = await Group.getGroups();
      if (getGroups.success) {
        return res.status(200).json(getGroups.message);
        // next（） callback 沒有回傳值 就會中止
      }
      // res.status(404).json(getGroups.error);
      return ErrorResponse(404, getGroups.error, res);
    } catch (error) {
      next(error); // 400(vaildate or 個別路由) 500
    }
  },

  createGroup: async (req, res, next) => {
    const {
      group_icon, group_title,
      sourceGroup_id, item_id,
      ...browserTabReq
    } = req.body;

    const browserTabData = {
      browserTab_favIconURL: browserTabReq.browserTab_favIconURL,
      browserTab_title: browserTabReq.browserTab_title,
      browserTab_url: browserTabReq.browserTab_url,
      browserTab_id: browserTabReq.browserTab_id,
      browserTab_index: browserTabReq.browserTab_index,
      browserTab_active: browserTabReq.browserTab_active,
      browserTab_status: browserTabReq.browserTab_status,
      windowId: browserTabReq.windowId,
    };

    let createdGroup;
    // NOTE - 需要 Group.createGroup封裝三個不同的方法嗎？
    // Group.createGroup({
    //   group_icon, group_title,
    //   sourceGroup_id, item_id,
    //   ...browserTabReq
    // })

    try {
      if (group_icon, group_title) {
        const isValid = Object.values(browserTabData).every((value) => value !== undefined);
        const isNone = Object.values(browserTabData).every((value) => value === undefined);
        if (isValid) {
          createdGroup = await Group.GroupCreatewithSidebarTabatBlank({
            ...browserTabData,
            group_icon,
            group_title,
          });
        } else if (isNone) {
          createdGroup = await Group.createGroupatBlank(group_icon, group_title);
        } else {
          // return res.status(400).json({ status: 'fail', message: 'invalid request body' });
          // throw new AppError(400, 'invalid request body');
          return ErrorResponse(400, 'invalid request body', res);
        }
      } else if (item_id, sourceGroup_id) {
        createdGroup = await Group.GroupCreatewithGroupTabtoBlank(item_id, sourceGroup_id);
      } else {
        // return res.status(400).json({ status: 'fail', message: 'invalid request body' });
        // throw new AppError(400, 'invalid request body');
        return ErrorResponse(400, 'invalid request body', res);
      }

      if (createdGroup.success) {
        return res.status(201).json(createdGroup.message);
      }
      // res.status(404).json(createdGroup.error);
      return ErrorResponse(404, createdGroup.error, res);
    } catch (error) {
      next(error); // 400 500
    }
  },

  updateGroup: async (req, res, next) => {
    const { group_id } = req.params;
    const { group_icon, group_title, group_pos } = req.body; // NOTE -三擇一

    const PatchGroupData = {
      group_icon: group_icon || undefined,
      group_title: group_title || undefined,
      group_pos: group_pos || undefined,
    };

    const isValid = Object.values(PatchGroupData)
      .filter((value) => value !== undefined).length === 1;

    try {
      if (!isValid) { throw new AppError(400, 'invalid request body'); }
      const updatedGroup = await Group.updateGroup(group_id, group_icon, group_title, group_pos);

      if (updatedGroup.success) {
        return res.status(200).json(updatedGroup.message);
      // NOTE - 比較簡潔但是要用swagger的耦合性來換，yang 傾向有else
      }
      // res.status(updatedGroup.statusCode).json(updatedGroup.error);
      // NOTE - vaild的邏輯寫在Group.function外面，就可以只有404的情況
      // res.status(404).json({ status: updatedGroup.status, message: updatedGroup.error });
      return ErrorResponse(404, updatedGroup.error, res);
    } catch (error) {
      next(error); // 400  500
    }
  },

  deleteGroup: async (req, res, next) => {
    const { group_id } = req.params;
    try {
      const deletedGroup = await Group.deleteGroup(group_id);
      if (deletedGroup.success) {
        return res.status(204).json(deletedGroup.message);
      }
      // NOTE - vaild的邏輯寫在Group.function外面，就可以只有404的情況
      return ErrorResponse(404, deletedGroup.error, res);
      // res.status(404).json({ status: deletedGroup.statusCode, message: deletedGroup.error });
      // methed1
      // res.status(deletedGroup.statusCode).json(deletedGroup.error);
      // method2
      // if (deletedGroup.statusCode === 404) {
      //   res.status(404).json(deletedGroup.error);
      // // }
      // if (deletedGroup.statusCode === 400) {
      //   res.status(400).json(deletedGroup.error);
      // }
      // method3
      // throw new AppError(deletedGroup.statusCode, deletedGroup.error);
    } catch (error) {
      next(error);// 400 500
    }
  },
};

module.exports = controller;

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
