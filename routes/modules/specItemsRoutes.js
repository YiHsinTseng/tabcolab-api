const router = require('express').Router();

const { validateItemDataTypes } = require('../../validations/validation-item');
const controller = require('../../controllers/specItemController');

router.post('/groups/:group_id/tabs', validateItemDataTypes, controller.addTab);
router.patch('/groups/:group_id/tabs/:item_id', validateItemDataTypes, controller.updateTab);
router.post('/groups/:group_id/notes', validateItemDataTypes, controller.addNote);
// router.patch('/groups/:group_id/notes/:item_id', validateItemDataTypes, controller.updateNote);
// router.patch('/groups/:group_id/todos/:item_id', validateItemDataTypes, controller.updateTodo);

module.exports = router;

/**
 * @openapi
 * /groups/{group_id}/tabs:
 *   parameters:
 *     - name: group_id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Group/properties/group_id'
 *       example: 1
 *   post:
 *     tags:
 *       - Items(Spec)
 *     security:
 *       -  bearerAuth: []
 *     summary: Add a new tab to an existing Group by dragging from Sidebar
 *     operationId: sidebarDragCreateGroupTab
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/addTab'
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Bad Request
 *       401:
 *         description: Invalid JWT or Missing JWT token
 *       '404':
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /groups/{group_id}/tabs/{item_id}:
 *   parameters:
 *     - name: group_id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Group/properties/group_id'
 *       example: 2
 *     - name: item_id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Item/properties/item_id'
 *       example: 4
 *   patch:
 *     tags:
 *       - Items(Spec)
 *     security:
 *       -  bearerAuth: []
 *     summary: Add or Modify a note within a tab
 *     operationId: groupTabPatchNote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/updateTab'
 *     responses:
 *       '200':
 *         description: Success
 *       '400':
 *         description: Bad Request
 *       401:
 *         description: Invalid JWT or Missing JWT token
 *       '404':
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /groups/{group_id}/notes:
 *   post:
 *     tags:
 *       - Items(Spec)
 *     security:
 *       -  bearerAuth: []
 *     summary: Add a note to an existing group
 *     description: Add a note to an existing group.
 *     parameters:
 *       - name: group_id
 *         in: path
 *         description: Group ID
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 *         example: '2'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/requestBodies/addNote'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item_id:
 *                   $ref: '#/components/schemas/Item/properties/item_id'
 *       '400':
 *         description: Bad Request
 *       401:
 *         description: Invalid JWT or Missing JWT token
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /groups/{group_id}/notes/{item_id}:
 *   patch:
 *     tags:
 *       - Items(Spec)
 *     security:
 *       -  bearerAuth: []
 *     summary: Modify a note's content or item_type in an existing group
 *     description:  'Modify the property of note in an existing group: <br> 1. Update the note_content field of note <br> 2. change item type from note to a todo'
 *     parameters:
 *       - name: group_id
 *         in: path
 *         description: Group ID
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 *         example: 2
 *       - name: item_id
 *         in: path
 *         description: Item ID
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Item/properties/item_id'
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *              - $ref: '#/components/requestBodies/NoteChangeContent'
 *              - $ref: '#/components/requestBodies/NoteChangetoTodo'
 *           examples:
 *             NoteChangeContent:
 *               summary: Update Note Content
 *               value:
 *                 note_content: "note_content"
 *             NoteChangetoTodo:
 *               summary: Note Change to Todo
 *               value:
 *                 item_type: 2
 *     responses:
 *       '200':
 *         description: Success
 *       '400':
 *         description: Bad Request
 *       401:
 *         description: Invalid JWT or Missing JWT token
 *       '404':
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /groups/{group_id}/todos/{item_id}:
 *   patch:
 *     tags:
 *       - Items(Spec)
 *     security:
 *       -  bearerAuth: []
 *     summary: Modify a todo's content, status  or item_type in an existing group
 *     description: 'Modify the property of todo in an existing group. <br>1. Update the note_content field of todo <br>2. Change item type from todo to note <br>3. Update the doneStatus of  todo'
 *     parameters:
 *       - name: group_id
 *         in: path
 *         description: Group ID
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Group/properties/group_id'
 *         example: 2
 *       - name: item_id
 *         in: path
 *         description: Item ID
 *         required: true
 *         schema:
 *           $ref: '#/components/schemas/Item/properties/item_id'
 *         example: 6
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/requestBodies/TodoContentUpdate'
 *               - $ref: '#/components/requestBodies/TodoChangetoNote'
 *               - $ref: '#/components/requestBodies/TodoStatusUpdate'
 *           examples:
 *             TodoContentUpdateExample:
*               summary: Update todo content
 *               value:
 *                 note_content: todo_content
 *             TodotoNoteExample:
 *               summary: Change todo to note
 *               value:
 *                 item_type: 1
 *             TodoStatusUpdateExample:
 *               summary: Update todo status
 *               value:
 *                 doneStatus: true
 *     responses:
 *       '200':
 *         description: Success
 *       '400':
 *         description: Bad Request
 *       401:
 *         description: Invalid JWT or Missing JWT token
 *       '404':
 *         description: Not Found
 *       500:
 *         description: Internal server error
 */
