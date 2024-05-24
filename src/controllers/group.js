const Joi = require('joi');
const { UserGroup, Group } = require('../models/group');

const { Tab } = require('../models/item');

const errorResponse = require('../utils/errorResponse');

const getGroups = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const result = await UserGroup.getGroups(user_id);
    if (result.success) {
      return res.status(200).json(result.groups);
    }
    return errorResponse(res, 404, result.message);
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

    const createGroupAtBlank = async ({ user_id, group_icon, group_title }) => {
      const newGroup = new Group({ group_icon, group_title, items: [] });
      const newUserGroup = new UserGroup({ user_id, groups: [newGroup] });

      const result = await newUserGroup.createGroupatBlank(user_id);
      return { result, newGroup };
    };

    const createGroupWithSidebarTab = async ({
      user_id, group_icon, group_title, browserTabData,
    }) => {
      const newTab = new Tab(browserTabData);
      const newGroup = new Group({ group_icon, group_title, items: [newTab] });
      const newUserGroup = new UserGroup({ user_id, groups: [newGroup] });

      const result = await newUserGroup.createGroupwithSidebarTab(user_id);
      return { result, newGroup, newTab };
    };

    const createGroupWithGroupTab = async ({
      user_id, group_icon, group_title, sourceGroup_id, item_id,
    }) => {
      // Ensure this method exists in UserGroup class
      const { sourceGroupItem } = await UserGroup.findGroupItem(user_id, sourceGroup_id, item_id);
      const newGroup = new Group({ group_icon, group_title, items: [sourceGroupItem] });
      const newUserGroup = new UserGroup({ user_id, groups: [newGroup] });

      const result = await newUserGroup.createGroupwithGroupTab(user_id, sourceGroup_id, item_id);
      return { result, newGroup };
    };

    let result;

    if (group_icon && group_title && keys.every((key) => validKeysForatBlank.includes(key))) {
      result = await createGroupAtBlank({ user_id, group_icon, group_title });
    } else if (group_icon && group_title && Object.values(browserTabData).every((value) => value !== undefined) && keys.every((key) => validKeysForSidebarTab.includes(key))) {
      const missingKeys = validKeysForSidebarTab.filter((key) => !(key in req.body));
      if (missingKeys.length > 0) {
        return errorResponse(res, 400, `"${missingKeys[0]}" is required`);
      }
      result = await createGroupWithSidebarTab({
        user_id, group_icon, group_title, browserTabData,
      });
    } else if (group_icon && group_title && sourceGroup_id && item_id && keys.every((key) => validKeysForGroupTab.includes(key))) {
      const missingKeys = validKeysForGroupTab.filter((key) => !(key in req.body));
      if (missingKeys.length > 0) {
        return errorResponse(res, 400, `"${missingKeys[0]}" is required`);
      }
      result = await createGroupWithGroupTab({
        user_id, sourceGroup_id, item_id, group_icon, group_title,
      });
    } else {
      return errorResponse(res, 400, 'Invalid request body');
    }

    if (result.result.success) {
      const response = { message: result.result.message, group_id: result.newGroup.group_id };
      if (result.newTab) {
        response.item_id = result.newTab.item_id;
      }
      return res.status(201).json(response);
    }
    return res.status(400).json({ error: 'Group creation failed' });
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { user_id } = req.user;
    const { group_id } = req.params;

    const groupToUpdate = await UserGroup.findGroupById(user_id, group_id);

    // Check that no extra fields in req.body
    const allowedFields = ['group_icon', 'group_title', 'group_pos'];
    for (const key in req.body) {
      if (!allowedFields.includes(key)) {
        return errorResponse(res, 400, `${key} is not allowed in request body`);
      }
    }
    const { group_icon, group_title, group_pos } = req.body;

    // Check that only one of group_icon, group_title, or group_pos is present
    const numProps = [group_icon, group_title, group_pos].filter((prop) => prop !== undefined).length;
    if (numProps !== 1) {
      return errorResponse(res, 400, 'Invalid request body, only one of group_icon, group_title, or group_pos should be present');
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
      return errorResponse(res, 400, 'Invalid request body');
    }

    if (result.success) {
      return res.status(200).json({ status: 'success', message: result.message });
    }
    return errorResponse(res, 400, 'Group failed to update');
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
      return res.status(204).header('X-Message', 'Group removed successfully').send();
    }
    return errorResponse(res, 400, 'Group failed to delete');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups, createGroup, updateGroup, deleteGroup,
};
