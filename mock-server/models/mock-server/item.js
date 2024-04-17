const jsonServer = require('json-server');
const config = require('../../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { db } = jsonServer.router(config[env].db.path);
const { generateItemId } = require('../../utils/generateId');

class Item {
  constructor({ item_type, note_bgColor }) {
    this.item_id = generateItemId();
    this.item_type = item_type;
    this.note_bgColor = note_bgColor;
  }

  static async getItemById(group_id, item_id, user_id) {
    const group = await this.db.get('user_groups').find({ user_id }).get('groups').find({ group_id })
      .value();

    if (group) {
      return group.items.find((item) => item.item_id === item_id);
    }
    return undefined;
  }

  static async searchItemsInGroups(keyword, itemTypeOptions, user_id) {
    const groups = await db.get('user_groups').find({ user_id }).get('groups').value();

    if (!Array.isArray(groups)) return [];

    const keywords = [...new Set(keyword.split(/\s{1}/))]; // NOTE 接受單一空格就代表空字串

    const regexes = keywords.map((currentKeyword) => new RegExp(`${currentKeyword}`, 'i'));

    const matchingItems = [];
    const seenItems = {};

    groups.forEach((group) => {
      group.items.forEach((item) => {
        if (!itemTypeOptions.includes(item.item_type)) return;

        const { browserTab_title, browserTab_url, note_content } = item;

        const matchesKeyword = regexes.some((regex) => {
          const matchTitle = regex.test(browserTab_title) && browserTab_title !== undefined;
          const matchUrl = regex.test(browserTab_url) && browserTab_url !== undefined;
          const matchNote = regex.test(note_content) && note_content !== undefined;

          return matchTitle || matchUrl || matchNote;
        });

        if (matchesKeyword) {
          const key = `${group.group_id}_${item.item_id}`;
          if (!seenItems[key]) {
            matchingItems.push({
              group_id: group.group_id,
              ...item,
            });
            seenItems[key] = true;
          }
        }
      });
    });

    return matchingItems;
  }

  static async moveItem(sourceGroupId, targetGroupId, itemId, newPosition, user_id) {
    const sourceGroup = await db.get('user_groups').find({ user_id }).get('groups').find({ group_id: sourceGroupId })
      .value();
    let targetGroup = await db.get('user_groups').find({ user_id }).get('groups')
      .find({ group_id: targetGroupId })
      .value();

    // ItemMoveinGroup
    /**
    * @openapi
    * components:
    *   requestBodies:
    *     ItemMoveinGroup:
    *       description: Move item within existing Groups
    *       type: object
    *       properties:
    *         targetItem_position:
    *           type: integer
    *           minimum: 0
    */
    // ItemMovetoGroup
    /**
     * @openapi
     * components:
     *   requestBodies:
     *     ItemMovetoGroup:
     *       description: Move item between existing Groups
     *       type: object
     *       properties:
     *         targetItem_position:
     *           type: integer
     *         targetGroup_id:
     *           $ref: '#/components/schemas/Group/properties/group_id'
     */

    if (!sourceGroup) {
      return { success: false, error: 'Source group not found' };
    }

    const itemToMove = sourceGroup.items.find((item) => item.item_id === itemId);

    if (!itemToMove) {
      return { success: false, error: 'Item not found in source group' };
    }

    if (!targetGroup) {
      targetGroup = sourceGroup;
    }

    const sourceIndex = sourceGroup.items.indexOf(itemToMove);
    sourceGroup.items.splice(sourceIndex, 1);

    let adjustedPosition = newPosition; // Create a new variable to hold the adjusted value

    if (newPosition !== undefined) {
      if (newPosition > targetGroup.items.length) {
        adjustedPosition = targetGroup.items.length;
      } else if (newPosition < 0) {
        adjustedPosition = 0;
      }
      targetGroup.items.splice(adjustedPosition, 0, itemToMove);
    } else {
      targetGroup.items.push(itemToMove);
    }

    await db.write();
    return { success: true, message: 'Item moved successfully' };
  }

  static async deleteItem(groupId, itemId, user_id) {
    const group = await db.get('user_groups').find({ user_id }).get('groups').find({ group_id: groupId })
      .value();

    if (!group) {
      return null; // 如果找不到該群組，返回null
    }
    const index = group.items.findIndex((item) => item.item_id === itemId);
    if (index === -1) {
      return null; // 如果在群組中找不到該項目，返回null
    }
    group.items.splice(index, 1); // 從群組中刪除該項目
    await db.write(); // 將更改寫回到資料庫
    return group; // 返回已刪除項目的群組對象
  }
}

class Tab extends Item {
  /**
   * @param {Object} browserTabData
   */
  constructor(browserTabData) {
    super({ item_type: 0, note_bgColor: null }); // 調用父類的構造函數，傳遞 item_type 和 note_bgColor
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
  Item, Tab,
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
