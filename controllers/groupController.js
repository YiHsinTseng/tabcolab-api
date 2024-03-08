const Group = require('../models/group');
const { generateGroupId, generateItemId } = require('../utils/generateId');

const getGroups = async (req, res, next) => {
  try {
    const result = await Group.getAll();

    if (result.success) {
      res.status(200).json({
        message: result.message,
        groups: result.groups,
      });
    } else {
      res.status(404).json({ message: result.error });
    }
  } catch (error) {
    next(error);
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

const createGroupWithGroupTab = (req, res) => {
  const {
    sourceGroup_id, group_icon, group_title, item_id,
  } = req.body;

  const group = Group.findById(sourceGroup_id);
  if (!group) {
    return res.status(404).json({ error: 'Source group not found' });
  }

  const group_id = generateGroupId();

  const newGroup = {
    id: group_id, // FIXME
    group_icon,
    group_title,
    items: group.items.filter((item) => item.id === item_id),
  };

  Group.createOne_mock(newGroup);

  res.status(201).json({
    message: 'Group created with tab from other group successfully',
    group_id,
  });
};

module.exports = { getGroups, createGroupWithSidebarTab, createGroupWithGroupTab };
