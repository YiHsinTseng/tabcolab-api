const mongoose = require('mongoose');
const { generateGroupId } = require('../../utils/generateId');

const AppError = require('../../utils/appError');
const { Item } = require('./item');

const GroupSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: generateGroupId,
    alias: 'group_id',
  },
  group_icon: {
    type: String,
    default: 'default_icon',
  },
  group_title: {
    type: String,
    default: 'Untitled',
  },
  items: {
    type: [Item],
    default: [],
  },
});

const UserGroupSchema = new mongoose.Schema({
  _id: {
    type: String,
    alias: 'user_id',
  },
  groups: [GroupSchema],
});

GroupSchema.statics.findGroupById = async function (user_id, group_id) {
  try {
    const group = await this.findOne({
      _id: group_id,
      user_id,
    });

    if (!group) {
      throw new AppError(404, 'Group not found or invalid group ID');
    }

    return group;
  } catch (error) {
    throw error;
  }
};

GroupSchema.statics.getGroups = async function (user_id) {
  try {
    const UserGroup = mongoose.model('UserGroup');
    const userGroup = await UserGroup.findOne({ user_id });

    if (!userGroup) {
      throw new AppError(500, 'No user group model in database');
    }

    const { groups } = userGroup;
    if (groups.length > 0) {
      return { success: true, message: 'Groups got successfully', groups };
    }

    return { success: false, message: 'Group not found' };
  } catch (error) {
    throw error;
  }
};

GroupSchema.statics.findGroupItem = async function (user_id, group_id, item_id) {
  // 你需要定義如何從 user_id, group_id 和 item_id 找到 item
};

GroupSchema.statics.deleteGroupItem = async function (user_id, group_id, item_id) {
  // 你需要定義如何從 user_id, group_id 和 item_id 刪除 item
};

GroupSchema.methods.createGroup = async function (user_id) {
  // 你需要定義如何創建 group
};

GroupSchema.statics.updateGroupInfo = async function (user_id, group) {
  // 你需要定義如何更新 group
};

GroupSchema.statics.changeGroupPosition = async function (user_id, group_id, group_pos) {
  // 你需要定義如何改變 group 的位置
};

GroupSchema.statics.deleteGroup = async function (user_id, group_id) {
  // 你需要定義如何刪除 group
};

module.exports = mongoose.model('Group', GroupSchema);
