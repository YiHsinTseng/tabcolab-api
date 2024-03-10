const config = require('../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const db_path = `../${config[env].db.db_path}`;
const db = require(db_path);
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

  static async getAll() {
    const groups = await db.getAllGroups();

    if (groups.length > 0) {
      return { success: true, message: 'group got successfully', groups };
    }
    return { success: false, error: 'group not found' };
  }

  async createGroup() {
    const result = await db.createGroup(this);
    if (result.success) {
      return { success: true, message: 'Sidebar group created successfully' };
    }
    return { success: false, error: 'group not created', details: result.details };
  }

  static async findById(group_id) {
    const group = await db.findGroupById(group_id);
    if (group && !group.items) {
      group.items = []; // 確保 items 屬性存在
    }
    return group;
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
