/**
 * @openapi
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         item_id:
 *           type: string
 *         item_type:
 *           type: integer
 *           enum: [0, 1, 2]
 *           description: '0: Tab, 1: Note, 2: Todo'
 *       oneOf:
 *         - $ref: '#/components/schemas/Tab'
 *         - $ref: '#/components/schemas/Note'
 *         - $ref: '#/components/schemas/Todo'
 *       required:
 *         - item_id
 *         - item_type
 *     Tab:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/ChromeTabInfo'
 *         - properties:
 *             note_content:
 *               type: string
 *             note_bgColor:
 *               type: string
 *       required:
 *         - note_bgColor
 *     Note:
 *       type: object
 *       properties:
 *         note_content:
 *           type: string
 *         note_bgColor:
 *           type: string
 *       required:
 *         - note_content
 *         - note_bgColor
 *     Todo:
 *       type: object
 *       properties:
 *         note_content:
 *           type: string
 *         note_bgColor:
 *           type: string
 *         doneStatus:
 *           type: boolean
 *           description: Indicates whether the todo is done or not
 *       required:
 *         - note_content
 *         - note_bgColor
 *         - doneStatus
 *     ChromeTabInfo:
 *       type: object
 *       properties:
 *         browserTab_favIconURL:
 *           type: string
 *         browserTab_title:
 *           type: string
 *         browserTab_url:
 *           type: string
 *         browserTab_id:
 *           type: integer
 *         browserTab_index:
 *           type: integer
 *         browserTab_active:
 *           type: boolean
 *         browserTab_status:
 *           type: string
 *           enum:
 *             - "complete"
 *             - "loading"
 *             - "unloaded"
 *         windowId:
 *           type: integer
 *           example: 1348438505
 *       required:
 *         - browserTab_favIconURL
 *         - browserTab_title
 *         - browserTab_url
 *         - browserTab_id
 *         - browserTab_index
 *         - browserTab_active
 *         - browserTab_status
 *         - windowId
 */
