const jsonServer = require('json-server');
const config = require('../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { db } = jsonServer.router(config[env].db.path);
const AppError = require('../utils/appError');
const { generateGroupId } = require('../utils/generateId');

class Group {
  /**
   * @param {string} groupIcon
   * @param {string} groupTitle
   * @param {Array} items Array of Item objects
   */
  constructor(groupIcon = 'default_icon', groupTitle = 'Untitled', items = []) {
    this.group_id = generateGroupId();
    this.group_icon = groupIcon;
    this.group_title = groupTitle;
    this.items = items;
  }

  static async findGroupById(group_id, next) {
    try {
      const group = db.get('groups').find({ group_id }).value();
      if (!group) {
        throw new AppError(404, 'Target Group not found');
      }
      return group;
    } catch (error) {
      next(error);
    }
  }

  static async findGroupItem(group_id, item_id, next) {
    try {
      const sourceGroup = await this.findGroupById(group_id, next);

      if (!sourceGroup.items) {
        throw new AppError(404, 'Target group does not contain items');
      }

      const itemIndex = sourceGroup.items.findIndex((item) => item.item_id === item_id);
      if (itemIndex === -1) {
        throw new AppError(404, 'Item not found in source group');
      }

      const sourceGroupItem = sourceGroup.items[itemIndex];

      return { sourceGroupItem, itemIndex };
    } catch (error) {
      next(error);
    }
  }

  static async deleteGroupItem(group_id, item_id, next) {
    try {
      const { itemIndex } = await this.findGroupItem(group_id, item_id, next);

      // Update the sourceGroup in the database
      await db.get('groups')
        .find({ group_id })
        .update('items', (items) => {
          items.splice(itemIndex, 1);
          return items;
        })
        .write();

      return { success: true, message: 'Item deleted successfully' };
    } catch (error) {
      next(error);
    }
  }

  static async getGroups(next) {
    try {
      const groups = await db.get('groups').value();
      if (!groups) {
        throw new AppError(500, 'No group model in database');
      }
      if (groups.length > 0) {
        return { success: true, message: 'Groups got successfully', groups };
      }
      return { success: false, message: 'Group not found' };
    } catch (error) {
      next(error);
    }
  }

  async createGroup(next) {
    try {
      let groups = db.get('groups');
      if (!groups.value()) {
        await db.defaults({ groups: [] }).write();
        groups = db.get('groups');
      }
      await groups.push(this).write();
    } catch (error) {
      next(error);
    }
  }

  async createGroupatBlank(next) {
    try {
      await this.createGroup(next);
      return { success: true, message: 'Group created at blank successfully' };
    } catch (error) {
      next(error);
    }
  }

  async createGroupwithSidebarTab(next) {
    try {
      await this.createGroup(next);
      return { success: true, message: 'Group created with sidebar tab successfully ' };
    } catch (error) {
      next(error);
    }
  }

  async createGroupwithGroupTab(sourceGroup_id, item_id, next) {
    try {
      await this.createGroup(next);
      await Group.deleteGroupItem(sourceGroup_id, item_id, next);
      return { success: true, message: 'Group created with group tab successfully ' };
    } catch (error) {
      next(error);
    }
  }

  static async updateGroup(group) {
    const result = await db.updateGroup(group);
    if (result.success) {
      return { success: true, message: 'Group updated successfully' };
    }
    return { success: false, error: 'Group not updated', details: result.details };
  }

  static async changePosition(group_id, group_pos) {
    const result = await db.changeGroupPosition(group_id, group_pos);
    if (result.success) {
      return { success: true, message: 'Group position updated successfully' };
    }
    return { success: false, error: 'Invalid request body', details: result.details };
  }

  static async deleteGroup(group_id) {
    const result = await db.deleteGroup(group_id);
    if (result.success) {
      return { success: true, message: result.message };
    }
    return { success: false, error: result.error, details: result.details };
  }
}

module.exports = Group;
