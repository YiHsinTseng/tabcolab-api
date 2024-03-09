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

  async createWithSidebarTab() {
    const result = await db.createGroupWithSidebarTab(this);
    if (result.success) {
      return { success: true, message: 'Sidebar group created successfully' };
    }
    return { success: false, error: 'group not created', details: result.details };
  }

  findById(group_id) {
    return db.findGroupById(group_id);
  }
}

module.exports = Group;
