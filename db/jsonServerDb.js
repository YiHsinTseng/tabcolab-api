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

  createGroup: async (group) => {
    try {
      let groups = db.get('groups');
      if (!groups.value()) {
        await db.defaults({ groups: [] }).write();
        groups = db.get('groups');
      }
      await groups.push(group).write();
      return { success: true, message: 'group created successfully' };
    } catch (error) {
      return { success: false, error: 'group not created', details: error.message };
    }
  },

  findGroupById: async (group_id) => {
    const groups = db.get('groups');
    if (!groups.value()) {
      return null;
    }
    return groups.find({ group_id }).value();
  },
};
