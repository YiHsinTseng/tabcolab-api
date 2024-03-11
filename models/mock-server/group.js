/**
 * @openapi
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         group_id:
 *           type: string
 *         group_icon:
 *           type: string
 *         group_title:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Item'
 *       required:
 *         - group_id
 *         - group_icon
 *         - group_title
 *         - items
 */
