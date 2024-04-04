const mongoose = require('mongoose');
const { generateGroupId } = require('../../utils/generateId');

const AppError = require('../../utils/appError');
const { ItemSchema } = require('./item');

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
    type: [ItemSchema],
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

UserGroupSchema.statics.findGroupById = async function (user_id, group_id) {
  const userGroup = await this.findOne({ _id: user_id }).exec();
  if (!userGroup) {
    throw new Error('User not found or invalid user ID');
  }
  const group = userGroup.groups.find((group) => group.group_id === group_id);
  if (!group) {
    throw new Error('Group not found or invalid group ID');
  }
  return group;
};

UserGroupSchema.statics.getGroups = async function (user_id) {
  const userGroup = await this.findOne({ _id: user_id }).exec();
  if (!userGroup) {
    throw new AppError(500, 'No user group model in database');
  }
  const { groups } = userGroup;
  if (groups.length > 0) {
    return { success: true, message: 'Groups got successfully', groups };
  }
  return { success: false, message: 'Group not found' };
};

UserGroupSchema.statics.findGroupItem = async function (user_id, group_id, item_id) {
  // 你需要定義如何從 user_id, group_id 和 item_id 找到 item
};

UserGroupSchema.statics.deleteGroupItem = async function (user_id, group_id, item_id) {
  // 你需要定義如何從 user_id, group_id 和 item_id 刪除 item
};

UserGroupSchema.methods.createGroup = async function (user_id) {
  // 你需要定義如何創建 group
};

UserGroupSchema.statics.updateGroupInfo = async function (user_id, group) {
  // 你需要定義如何更新 group
};

UserGroupSchema.statics.changeGroupPosition = async function (user_id, group_id, group_pos) {
  // 你需要定義如何改變 group 的位置
};

UserGroupSchema.statics.deleteGroup = async function (user_id, group_id) {
  // 你需要定義如何刪除 group
};

const Group = mongoose.model('Group', GroupSchema);
const UserGroup = mongoose.model('UserGroup', UserGroupSchema);
module.exports = { Group, UserGroup };
