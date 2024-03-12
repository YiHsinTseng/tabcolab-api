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
