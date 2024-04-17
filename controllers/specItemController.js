const env = process.env.NODE_ENV || 'development';

const config = require('../configs/config.json');

const { Tab } = require(`../${config[env].db.modelpath}/item`);

const addTab = async (req, res) => {
  const { group_id } = req.params;
  const { user_id } = req.user;
  const {
    targetItem_position,
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

  const validKeysForAddTab = [targetItem_position, ...Object.keys(browserTabData)];

  if (group_id && targetItem_position != undefined && validKeysForAddTab.every((key) => key !== undefined)) {
    const newTab = new Tab(browserTabData);

    try {
      await newTab.addTab(user_id, group_id, targetItem_position);
      return res.status(201).json({ status: 'success', message: 'New tab added to group successfully', item_id: newTab.item_id });
    } catch (error) {
      return res.status(404).json({ status: 'fail', message: error.message });
    }
  }

  return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
};

const updateTab = async (req, res) => {
  const { group_id, item_id } = req.params;
  const { user_id } = req.user;
  const { note_content } = req.body;

  try {
    const updatedNoteContent = await Tab.updateTab(user_id, group_id, item_id, note_content);

    return res.status(201).json({ status: 'success', message: 'Note added to tab successfully', note_content: updatedNoteContent });
  } catch (error) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }
};

module.exports = {
  addTab, updateTab,
};
