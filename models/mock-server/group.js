const db = require('../../db');
const { generateGroupId } = require('../../utils/generateId');

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
    try {
      return await db.getAllGroups();
    } catch (error) {
      console.error('Error getting all groups:', error);
      throw error;
    }
  }

  async createWithSidebarTab() {
    return await db.createGroupWithSidebarTab(this);
  }
}

module.exports = Group;
