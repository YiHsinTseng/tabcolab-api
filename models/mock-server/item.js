// const config = require('../configs/config.json');

// const env = process.env.NODE_ENV || 'development';
// const db_path = `../${config[env].db.db_path}`;
// const db = require(db_path);
const { generateItemId } = require('../../utils/generateId');

class Item {
  constructor() {
    this.item_id = generateItemId();
  }
}

class Tab extends Item {
  /**
   * @param {Object} browserTabData
   */
  constructor(browserTabData) {
    super(); // 調用父類的構造函數
    /** @type {number} */
    this.item_type = 0;
    /** @type {string} */
    this.browserTab_favIconURL = browserTabData.browserTab_favIconURL;
    /** @type {string} */
    this.browserTab_title = browserTabData.browserTab_title;
    /** @type {string} */
    this.browserTab_url = browserTabData.browserTab_url;
    /** @type {number} */
    this.browserTab_id = browserTabData.browserTab_id;
    /** @type {number} */
    this.browserTab_index = browserTabData.browserTab_index;
    /** @type {boolean} */
    this.browserTab_active = browserTabData.browserTab_active;
    /** @type {string} */
    this.browserTab_status = browserTabData.browserTab_status;
    /** @type {number} */
    this.windowId = browserTabData.windowId;
  }
}

module.exports = {
  Tab,
};

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
