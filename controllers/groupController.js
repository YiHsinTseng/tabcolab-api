const Group = require('../models/mock-server/group');

const getGroups = async (req, res) => {
  const groups = await Group.getAll();

  if (groups) {
    res.status(200).json(groups);
  } else {
    res.status(404).json({ error: 'No group in workspace' });
  }
};

module.exports = { getGroups };
