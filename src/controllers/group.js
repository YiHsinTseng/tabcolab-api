const { UserGroup, Group } = require('../models/group');

const { Tab } = require('../models/item');

const ErrorResponse = (statusCode, message, res) => {
  const status = statusCode === 500 ? 'error' : 'fail';
  res.status(statusCode).json({ status, message });
};

const getGroups = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const result = await UserGroup.getGroups(user_id);
    if (result.success) {
      return res.status(200).json(result.groups);
    }
    return ErrorResponse(404, result.message, res);
  } catch (error) {
    next(error);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const {
      group_icon, group_title,
      sourceGroup_id, item_id,
      ...browserTabReq
    } = req.body;

    const browserTabData = {
      browserTab_favIconURL: browserTabReq.browserTab_favIconURL,
      browserTab_title: browserTabReq.browserTab_title,
      browserTab_url: browserTabReq.browserTab_url,
      browserTab_id: Number(browserTabReq.browserTab_id),
      browserTab_index: Number(browserTabReq.browserTab_index),
      browserTab_active: Boolean(browserTabReq.browserTab_active),
      browserTab_status: browserTabReq.browserTab_status,
      windowId: Number(browserTabReq.windowId),
    };

    const keys = Object.keys(req.body);
    const validKeysForatBlank = ['group_icon', 'group_title'];
    const validKeysForSidebarTab = ['group_icon', 'group_title', ...Object.keys(browserTabData)];
    const validKeysForGroupTab = ['sourceGroup_id', 'group_icon', 'group_title', 'item_id'];

    let result;
    let newGroup;
    let newUserGroup;

    if (group_icon
      && group_title
      && keys.every((key) => validKeysForatBlank.includes(key))) {
      newGroup = new Group({ group_icon, group_title, items: [] });
      newUserGroup = new UserGroup({ user_id, groups: [newGroup] });
      result = await newUserGroup.createGroupatBlank(user_id);
      if (result.success) {
        return res.status(201).json({ message: result.message, group_id: newGroup.group_id });
      }
    } else if (
      group_icon
      && group_title
      && Object.values(browserTabData).every((value) => value !== undefined)
      && keys.every((key) => validKeysForSidebarTab.includes(key))
    ) {
      const newTab = new Tab(browserTabData);

      newGroup = new Group({ group_icon, group_title, items: [newTab] });
      newUserGroup = new UserGroup({ user_id, groups: [newGroup] });

      result = await newUserGroup.createGroupwithSidebarTab(user_id);
      if (result.success) {
        return res.status(201).json({ message: result.message, group_id: newGroup.group_id, item_id: newTab.item_id });
      }
    } else if (
      sourceGroup_id
      && group_icon
      && group_title
      && item_id
      && keys.every((key) => validKeysForGroupTab.includes(key))
    ) {
      const { sourceGroupItem } = await UserGroup.findGroupItem(user_id, sourceGroup_id, item_id);
      newGroup = new Group({ group_icon, group_title, items: [sourceGroupItem] });
      newUserGroup = new UserGroup({ user_id, groups: [newGroup] });
      result = await newUserGroup.createGroupwithGroupTab(user_id, sourceGroup_id, item_id);
      if (result.success) {
        return res.status(201).json({ message: result.message, group_id: newGroup.group_id });
      }
    } else {
      return ErrorResponse(400, 'Invalid request body', res);
    }

    return ErrorResponse(400, 'Group failed to create', res);
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { group_id } = req.params;

    const groupToUpdate = await UserGroup.findGroupById(user_id, group_id);

    const { group_icon, group_title, group_pos } = req.body;

    // Check that only one of group_icon, group_title, or group_pos is present
    const numProps = [group_icon, group_title, group_pos].filter((prop) => prop !== undefined).length;
    if (numProps !== 1) {
      return ErrorResponse(400, 'Invalid request body, only one of group_icon, group_title, or group_pos should be present', res);
    }

    let result;

    if (group_id && group_icon) {
      groupToUpdate.group_icon = group_icon;
      result = await UserGroup.updateGroupInfo(user_id, groupToUpdate);
    } else if (group_id && group_title) {
      groupToUpdate.group_title = group_title;
      result = await UserGroup.updateGroupInfo(user_id, groupToUpdate);
    } else if (group_id && group_pos !== undefined) {
      result = await UserGroup.changeGroupPosition(user_id, group_id, group_pos);
    } else {
      return ErrorResponse(400, 'Invalid request body', res);
    }

    if (result.success) {
      return res.status(200).json({ status: 'success', message: result.message });
    }
    return ErrorResponse(400, 'Group failed to update', res);
  } catch (error) {
    next(error);
  }
};

const deleteGroup = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { group_id } = req.params;

    const result = await UserGroup.deleteGroup(user_id, group_id);
    if (result.success) {
      return res.status(200).json({ status: 'success', message: result.message });
    }
    return ErrorResponse(400, 'Group failed to delete', res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups, createGroup, updateGroup, deleteGroup,
};
