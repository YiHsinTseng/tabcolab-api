const Group = require('../models/mock-server/group');
const { generateGroupId, generateItemId } = require('../utils/generateId');

const getGroups = async (req, res) => {
  const groups = await Group.getAll();

  if (groups) {
    res.status(200).json(groups);
  } else {
    res.status(404).json({ error: 'No group in workspace' });
  }
};

const createGroupWithSidebarTab = (req, res) => {
  const item_id = generateItemId();

  const {
    group_icon,
    group_title,
    browserTab_favIconURL,
    browserTab_title,
    browserTab_url,
  } = req.body;

  const newItem = {
    browserTab_favIconURL, browserTab_title, browserTab_url, item_id,
  };

  const newGroup = new Group(group_icon, group_title, [newItem]);

  newGroup.createWithSidebarTab();

  res.status(201).json({
    message: 'Sidebar group created successfully',
    group_id: newGroup.group_id,
    item_id,
  });
};

module.exports = { getGroups, createGroupWithSidebarTab };
