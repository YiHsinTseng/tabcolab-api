const Group = require('../models/group');
const { Tab } = require('../models/item');

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

const createGroupWithSidebarTab = async (req, res) => {
  const {
    group_icon,
    group_title,
    browserTab_favIconURL,
    browserTab_title,
    browserTab_url,
  } = req.body;

  if (!group_icon || !group_title || !browserTab_favIconURL || !browserTab_title || !browserTab_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTab = new Tab(browserTab_favIconURL, browserTab_title, browserTab_url);
    const newGroup = new Group(group_icon, group_title, [newTab]);

    const result = await newGroup.createGroup();
    if (result.success) {
      return res.status(201).json({ message: result.message, group: newGroup });
    }
    return res.status(500).json({ error: result.error, details: result.details });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the group', details: error.message });
  }
};

const createGroupWithGroupTab = async (req, res) => {
  try {
    const {
      sourceGroup_id, group_icon, group_title, item_id,
    } = req.body;

    const sourceGroup = await Group.findById(sourceGroup_id);
    if (!sourceGroup) {
      return res.status(404).json({ error: 'Source group not found' });
    }

    if (!sourceGroup.items) {
      return res.status(500).json({ error: 'Source group does not contain items' });
    }

    const itemIndex = sourceGroup.items.findIndex((item) => item.item_id === item_id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in source group' });
    }

    const item = sourceGroup.items[itemIndex];

    const newGroup = new Group(group_icon, group_title, [item]);

    const result = await newGroup.createGroup();
    if (result.success) {
      // Remove the item from the source group and update the source group
      sourceGroup.items.splice(itemIndex, 1);
      await Group.updateGroup(sourceGroup);

      return res.status(201).json({ message: 'Group created with tab from other group successfully', group: newGroup });
    }
    return res.status(500).json({ error: result.error, details: result.details });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the group', details: error.message });
  }
};

module.exports = { getGroups, createGroupWithSidebarTab, createGroupWithGroupTab };
