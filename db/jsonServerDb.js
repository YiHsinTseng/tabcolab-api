const jsonServer = require('json-server');

const { db } = jsonServer.router('../mock-server/db.json');

module.exports = {
  getAllGroups: async () => {
    try {
      return await db.get('groups').value();
    } catch (error) {
      console.error('Error getting all groups:', error);
      throw error;
    }
  },

  createGroupWithSidebarTab: async (group) => await db.get('groups').push(group).write(),

  findGroupById: async (group_id) => await db.get('groups').find({ group_id }).value(),
};
