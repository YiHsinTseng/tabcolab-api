const { Item } = require('../models/item');

const searchItemsInGroups = async (req, res) => {
  try {
    const { keyword, itemTypes } = req.query;
    const { user_id } = req.user;

    if (keyword === undefined) {
      return res.status(400).json({ status: 'fail', message: 'Invalid Query Parameters' });
    }
    const itemTypeOptions = itemTypes ? itemTypes.split(',').map(Number) : [0, 1, 2];
    const searchResults = await Item.searchItemsInGroups(keyword, itemTypeOptions, user_id);

    return res.status(200).json(searchResults);
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

const moveItem = async (req, res) => {
  try {
    const { group_id, item_id } = req.params;
    const { targetGroup_id, targetItem_position } = req.body;
    const { user_id } = req.user;

    if (!targetGroup_id && targetItem_position === undefined) {
      return res.status(400).json({ status: 'fail', message: 'Request Bodies Required' });
    } if (targetGroup_id && targetItem_position === undefined) {
      return res.status(400).json({ status: 'fail', message: 'Invalid Request Bodies' });
    }

    const moveResult = await Item.moveItem(group_id, targetGroup_id, item_id, targetItem_position, user_id);
    if (moveResult.success) {
      return res.status(200).json({ status: 'success', message: moveResult.message, item_id });
    }
    return res.status(404).json({ status: 'fail', message: moveResult.error });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { group_id, item_id } = req.params;
    const { user_id } = req.user;
    const deletedItem = await Item.deleteItem(group_id, item_id, user_id);
    if (!deletedItem) {
      return res.status(404).json({ status: 'fail', message: 'Group or item not found' });
    }
    return res.status(204).header('X-Message', 'Item removed from group successfully').send();
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

module.exports = {
  moveItem,
  deleteItem,
  searchItemsInGroups,
};
