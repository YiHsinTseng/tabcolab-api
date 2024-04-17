const router = require('express').Router();
const controller = require('../../controllers/itemController');
const { validateItemDataTypes } = require('../../validations/validation-item');

router.get('/groups/items/search', validateItemDataTypes, controller.searchItemsInGroups);
router.patch('/groups/:group_id/items/:item_id', validateItemDataTypes, controller.moveItem);
router.delete('/groups/:group_id/items/:item_id', validateItemDataTypes, controller.deleteItem);

module.exports = router;

/**
 * @openapi
 * /groups/items/search:
 *   get:
 *     tags:
 *       - Items
 *     security:
 *       -  bearerAuth: []
 *     summary: Search items in all groups by keyword and filter by item_type
 *     description: Retrieve items in all groups that match the provided keyword.<br><br>Here's the API format :<br>`/groups/items/search?keyword={keyword}&itemTypes={item_type1},{item_type2}`<br>Where keyword is a required field. <br>If itemTypes is not specified or empty, it defaults to returning matching results for all the item_types.<br><br>Below are potential scenarios for the keyword parameter:<br> 1. A single space is utilized to separate two keywords, as seen in "keywordA keywordB." This format triggers separate searches for each keyword.<br>2. If the parameter consists solely of spaces, like " ", the search will include results containing empty strings and spaces.<br>3. Consecutive spaces within the parameter will trigger additional searches for empty strings. For instance, in "keywordC&nbsp;&nbsp;keywordD," the search will include keywordC, keywordD, as well as empty strings and spaces.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         description: The keyword to search for items.
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: itemTypes
 *         description: Filter by selected item types.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item/properties/item_type'
 *         style: form
 *         explode: false
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 allOf:
 *                   - type: object
 *                     properties:
 *                       groupId:
 *                         type: string
 *                         description: The ID of the group
 *                   - $ref: '#/components/schemas/Item'
 *       400:
 *         description: 'Invalid Query Parameters'
 *       401:
 *         description: Invalid JWT or Missing JWT token
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /groups/{group_id}/items/{item_id}:
 *   parameters:
 *     - name: group_id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Group/properties/group_id'
 *       example: 1
 *     - name: item_id
 *       in: path
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Item/properties/item_id'
 *       example: 1
 *   patch:
 *     tags:
 *       - Items
 *     security:
 *       -  bearerAuth: []
 *     summary: Move item (tab, note, todo) within or between existing Groups
 *     description: 'Move item (tab, note, todo) :<br> 1. Within existing Groups <br> 2. Between existing Groups'
 *     operationId: groupItemDragPatchGroup
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/requestBodies/ItemMoveinGroup'
 *               - $ref: '#/components/requestBodies/ItemMovetoGroup'
 *           examples:
 *             ItemMoveinGroup:
 *               summary: Moving an item within the same group.
 *               value:
 *                 targetItem_position: 2
 *             ItemMovetoGroup:
 *               summary: Moving an item to a different group.
 *               value:
 *                 targetItem_position: 1
 *                 targetGroup_id: '2'
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
 *   delete:
 *     parameters:
 *       - name: group_id
 *         in: path
 *         example: 2
 *       - name: item_id
 *         in: path
 *         example: 6
 *     tags:
 *       - Items
 *     security:
 *       -  bearerAuth: []
 *     summary: Remove item (tab, note, todo) from existing Group
 *     operationId: groupPatchItem
 *     responses:
 *       '204':
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
