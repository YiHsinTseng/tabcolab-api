const jsonServer = require('json-server');
const config = require('../../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { db } = jsonServer.router(config[env].db.path);
const AppError = require('../../utils/appError');
const { generateGroupId } = require('../../utils/generateId');

class UserGroup {
  /**
   * @param {string} user_id
   * @param {Array} groups Array of Group objects
   */
  constructor({ user_id, groups = [] }) {
    this.user_id = user_id;
    this.groups = groups;
  }

  static async findGroupById(user_id, group_id) {
    const userGroup = await db.get('user_groups').find({ user_id }).value();
    if (!userGroup) {
      throw new AppError(404, 'User not found or invalid user ID');
    }
    const group = userGroup.groups.find((group) => group.group_id === group_id);
    if (!group) {
      throw new AppError(404, 'Group not found or invalid group ID');
    }
    return group;
  }

  static async findGroupItem(user_id, group_id, item_id) {
    const sourceGroup = await this.findGroupById(user_id, group_id);

    if (!sourceGroup.items) {
      throw new AppError(404, 'Target group does not contain items');
    }

    const itemIndex = sourceGroup.items.findIndex((item) => item.item_id === item_id);
    if (itemIndex === -1) {
      throw new AppError(404, 'Item not found in source group');
    }

    const sourceGroupItem = sourceGroup.items[itemIndex];

    return { sourceGroupItem, itemIndex };
  }

  static async deleteGroupItem(user_id, group_id, item_id) {
    const { itemIndex } = await this.findGroupItem(user_id, group_id, item_id);

    // Update the sourceGroup in the database
    await db.get('user_groups')
      .find({ user_id })
      .get('groups')
      .find({ group_id })
      .update('items', (items) => {
        items.splice(itemIndex, 1);
        return items;
      })
      .write();

    return { success: true, message: 'Item deleted successfully' };
  }

  static async getGroups(user_id) {
    const userGroup = await db.get('user_groups').find({ user_id }).value();
    if (!userGroup) {
      throw new AppError(500, 'No user group model in database');
    }
    const { groups } = userGroup;
    if (groups.length > 0) {
      return { success: true, message: 'Groups got successfully', groups };
    }
    return { success: false, message: 'Group not found' };
  }

  async createGroup(user_id) {
    let userGroups = db.get('user_groups').find({ user_id }).value();
    if (!userGroups) {
      await db.get('user_groups').push({ user_id, groups: [] }).write();
      userGroups = db.get('user_groups').find({ user_id }).value();
    }
    if (!userGroups.groups) {
      userGroups.groups = [];
    }
    userGroups.groups = userGroups.groups.concat(this.groups);
    await db.get('user_groups').find({ user_id }).assign(userGroups).write();
    return { success: true, message: 'Group created successfully' };
  }

  async createGroupatBlank(user_id) {
    await this.createGroup(user_id);
    return { success: true, message: 'Group created at blank successfully' };
  }

  async createGroupwithSidebarTab(user_id) {
    await this.createGroup(user_id);
    return { success: true, message: 'Group created with sidebar tab successfully ' };
  }

  async createGroupwithGroupTab(user_id, sourceGroup_id, item_id) {
    await this.createGroup(user_id);
    await UserGroup.deleteGroupItem(user_id, sourceGroup_id, item_id);
    return { success: true, message: 'Group created with group tab successfully ' };
  }

  static async updateGroupInfo(user_id, group) {
    // Update the group in the database
    await db.get('user_groups')
      .find({ user_id })
      .get('groups')
      .find({ group_id: group.group_id })
      .assign(group)
      .write();

    return { success: true, message: 'Group info updated successfully' };
  }

  static async changeGroupPosition(user_id, group_id, group_pos) {
    const { groups } = await UserGroup.getGroups(user_id);
    const groupIndex = groups.findIndex((group) => group.group_id === group_id);
    if (groupIndex !== -1 && group_pos >= 0 && group_pos < groups.length) {
      // Remove the group from its current position
      const [movedGroup] = groups.splice(groupIndex, 1);
      // Insert the group at the new position
      groups.splice(group_pos, 0, movedGroup);

      // Update the group in the database
      await db.get('user_groups')
        .find({ user_id })
        .get('groups')
        .find({ group_id: movedGroup.group_id })
        .assign(movedGroup)
        .write();

      return { success: true, message: 'Group position updated successfully' };
    }
    throw new AppError(400, 'Invalid group ID or position');
  }

  static async deleteGroup(user_id, group_id) {
    await this.findGroupById(user_id, group_id);

    const deletedGroup = await db.get('user_groups')
      .find({ user_id })
      .get('groups')
      .remove((group) => group.group_id === group_id)
      .write();

    if (deletedGroup.length > 0) {
      return { success: true, message: 'Group deleted successfully' };
    }
  }
}

class Group {
  /**
   * @param {string} groupIcon
   * @param {string} groupTitle
   * @param {Array} items Array of Item objects
   */
  constructor({ groupIcon = 'default_icon', groupTitle = 'Untitled', items = [] }) {
    this.group_id = generateGroupId();
    this.group_icon = groupIcon;
    this.group_title = groupTitle;
    this.items = items;
  }
}

module.exports = { Group, UserGroup };

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
 */
