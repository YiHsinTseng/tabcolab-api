const jsonServer = require('json-server');

const { db } = jsonServer.router('../mock-server/db.json');

module.exports = {
  getAllGroups: async () => {
    try {
      return await db.get('groups').value();
    } catch (error) {
      console('Error getting all groups:', error);
      throw error;
    }
  },
};
