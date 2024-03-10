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

  updateGroup: async (group) => {
    try {
      const groups = db.get('groups');
      const groupToUpdate = groups.find({ group_id: group.group_id });

      if (!groupToUpdate.value()) {
        return { success: false, details: 'Group not found' };
      }

      await groupToUpdate.assign(group).write();
      return { success: true, message: 'Group updated successfully' };
    } catch (error) {
      return { success: false, error: 'Group not updated', details: error.message };
    }
  },

  changeGroupPosition: async (group_id, group_pos) => {
    try {
      const groups = db.get('groups').value();
      const groupIndex = groups.findIndex((group) => group.group_id === group_id);
      if (groupIndex !== -1 && group_pos >= 0 && group_pos < groups.length) {
      // Remove the group from its current position
        const [movedGroup] = groups.splice(groupIndex, 1);
        // Insert the group at the new position
        groups.splice(group_pos, 0, movedGroup);
        db.write();
        return { success: true, message: 'Group position updated successfully' };
      }
    } catch (error) {
      return { success: false, error: 'Invalid request body', details: error.message };
    }
  },

  deleteGroup: async (group_id) => {
    try {
      await db.get('groups')
        .remove((group) => group.group_id === group_id)
        .write();
      return { success: true, message: 'Group deleted successfully' };
    } catch (error) {
      return { success: false, error: 'Group not deleted', details: error.message };
    }
  },

};
