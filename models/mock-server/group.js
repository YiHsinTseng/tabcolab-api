const jsonServer = require('json-server');
const config = require('../../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { db } = jsonServer.router(config[env].db.path);
const AppError = require('../../utils/appError');

class Group {
  /**
   * @param {string} group_id
   * @param {string} group_icon
   * @param {string} group_title
   * @param {Array} items Array of Item objects
   */

  // TODO - yang
  constructor(group_id, group_icon, group_title, items) {
    this.group_id = group_id;
    this.group_icon = group_icon;
    this.group_title = group_title;
    this.items = items;
  }

  // NOTE- db docker- yang
  static async findId(targetGroupId) {
    const group = db.get('groups').find({ group_id: targetGroupId }).value(); // NOTE- 欄位名稱
    if (!group) {
      console.log(1);
      throw new AppError(404, 'Group not found');
      // return { exist: false, error: { success: false, error: 'Group not found' } };
    }
    // NOTE - 會傳給上層函數形成 上層函數.success嗎？
    return group;
  }

  static async findGroupItem(targetGroupId, item_id) {
    const group = await Group.findId(targetGroupId);

    const groupItem = group.items.find((item) => item.item_id === item_id);
    if (groupItem === undefined) {
      throw new AppError(404, 'Item no found in group');
      // return { exist: false, error: { success: false, error: 'Item no found in group' } };
    }
    return groupItem;
  }

  static async getGroups() {
    return { success: true, message: 'Success' };
    // TODO - 404  worksapce not found
  }

  // NOTE - 需要 Group.createGroup封裝三個不同的方法嗎？
  // static async createGroup() {
  //   // return { success: false, error: 'Invaild Request Body' };
  //   return { success: true, message: 'Success' };
  //   // return { success: false, error: 'error' };
  // }

  static async createGroupatBlank(group_icon, group_title) {
    return { success: true, message: 'Success' };
  }

  static async GroupCreatewithSidebarTabatBlank(
    group_icon,
    group_title,
    browserTab_favIconURL,
    browserTab_title,
    browserTab_url,
    browserTab_id,
    browserTab_index,
    browserTab_active,
    browserTab_status,
    windowId,
  ) {
    return { success: true, message: 'Success' };
    // TODO-
  }

  static async GroupCreatewithGroupTabtoBlank(item_id, sourceGroup_id) {
    // return { success: false, error: 'Invaild Request Body' };
    try {
      const item = await Group.findGroupItem(sourceGroup_id, item_id);
      item;
      console.log(item);
      // console.log(group);
      return { success: true, message: 'Success' };
    } catch (error) {
      return { success: false, statusCode: error.statusCode, error: error.message };
    }
  }

  static async updateGroup(group_id, group_icon, group_title, group_pos) {
    try {
      const group = await Group.findId(group_id);

      if (group_icon !== undefined) {
        // group.group_icon=
        return { success: true, message: 'Success' };
      } if (group_title !== undefined) {
        // group.group_title=
        return { success: true, message: 'Success' };
      } if (group_pos !== undefined) {
        // TODO
        return { success: true, message: 'Success' };
      }
      return { success: true, message: 'Success' };
    } catch (error) {
      return {
        success: false, statusCode: error.statusCode, status: error.status, error: error.message,
      };
    }
  }

  static async deleteGroup(group_id) {
    try {
      await Group.findId(group_id);

      // console.log(group);
      return { success: true, message: 'Success' };
    } catch (error) {
      console.log(2);
      return { success: false, statusCode: error.statusCode, error: error.message };
    }
  }
}

module.exports = Group;

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
