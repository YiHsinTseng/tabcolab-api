const mongoose = require('mongoose');
const { generateItemId } = require('../../utils/generateId');

const ItemSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateItemId,
    alias: 'item_id',
  },
});

const TabSchema = new mongoose.Schema({
  ...ItemSchema.obj, // 繼承 ItemSchema 的屬性
  item_type: {
    type: Number,
    default: 0,
  },
  browserTab_favIconURL: String,
  browserTab_title: String,
  browserTab_url: String,
  browserTab_id: Number,
  browserTab_index: Number,
  browserTab_active: Boolean,
  browserTab_status: String,
  windowId: Number,
});

module.exports = {
  ItemSchema,
  Item: mongoose.model('Item', ItemSchema),
  Tab: mongoose.model('Tab', TabSchema),
  TabSchema,
};
