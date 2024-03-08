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

  // static async getAll() {
  //   try {
  //     return await db.getAllGroups();
  //   } catch (error) {
  //     console.error('Error getting all groups:', error);
  //     throw error;
  //   }
  // }

  static async getAll() {
    const groups = await db.getAllGroups();

    if (groups.length > 0) {
      return { success: true, message: 'group got successfully', groups };
    }
    return { success: false, error: 'group not found' };
  }

  async createWithSidebarTab() {
    return await db.createGroupWithSidebarTab(this);
  }

  async findById(group_id) {
    return await db.findGroupById(group_id);
  }
}

module.exports = Group;
