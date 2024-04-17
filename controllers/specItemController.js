const env = process.env.NODE_ENV || 'development';

const config = require('../configs/config.json');

const { Tab, Note, Todo } = require(`../${config[env].db.modelpath}/item`);

const addTab = async (req, res) => {
  try {
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

      await newTab.addTab(user_id, group_id, targetItem_position);
      return res.status(201).json({ status: 'success', message: 'New tab added to group successfully', item_id: newTab.item_id });
    }

    return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
  } catch (error) {
    return res.status(404).json({ status: 'fail', message: error.message });
  }
};

const updateTab = async (req, res) => {
  try {
    const { group_id, item_id } = req.params;
    const { user_id } = req.user;
    const { note_content } = req.body;

    const updatedNoteContent = await Tab.updateTab(user_id, group_id, item_id, note_content);

    return res.status(201).json({ status: 'success', message: 'Note added to tab successfully', note_content: updatedNoteContent });
  } catch (error) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }
};

const addNote = async (req, res) => {
  try {
    const { group_id } = req.params;
    const { user_id } = req.user;
    const { note_content, note_bgColor } = req.body;

    if (Object.keys(req.body).length > 2) {
      return res.status(404).json({ status: 'fail', message: 'Unexpected Additional Parameters' });
    }

    if (note_content === '') {
      return res.status(404).json({ status: 'fail', message: '"note_content" is not allowed to be empty' });
    }

    if (note_content === undefined && note_bgColor === undefined && Object.keys(req.body).length === 2) {
      return res.status(404).json({ status: 'fail', message: 'Request Bodies Required' });
    }

    if (group_id && note_content !== undefined && note_bgColor) {
      const newNote = new Note({ note_content, note_bgColor });

      await newNote.addNoteToGroup(group_id, user_id);
      return res.status(201).json({ status: 'success', message: 'Note added to group successfully', item_id: newNote.item_id });
    }
    return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { group_id, item_id } = req.params;
    const { user_id } = req.user;
    const { item_type, note_content } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Request Bodies Required' });
    }
    if (Object.keys(req.body).length > 1) {
      return res.status(404).json({ status: 'fail', message: 'Unexpected Additional Parameters' });
    }
    if (note_content === undefined && item_type !== 2) {
      return res.status(404).json({ status: 'fail', message: 'Invaild Request Bodies', detail: 'Only change Note to Todo, item_type must be 2' });
    }

    if (group_id && note_content !== undefined) {
      await Note.updateNoteContent(user_id, group_id, item_id, note_content);
      return res.status(200).json({ status: 'success', message: 'Note content changed successfully' });
    }

    if (group_id && note_content === undefined && item_type === 2) {
      await Note.convertToTodo(user_id, group_id, item_id);
      return res.status(200).json({ status: 'success', message: 'Note changed to todo successfully' });
    }
    return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

const updateTodo = async (req, res) => {
  try {
    const { group_id, item_id } = req.params;
    const { user_id } = req.user;
    const { item_type, doneStatus, note_content } = req.body;

    if (Object.keys(req.body).length > 1) {
      return res.status(404).json({ status: 'fail', message: 'Unexpected Additional Parameters' });
    }

    if (item_type === undefined && !doneStatus && note_content === undefined) {
      return res.status(404).json({ status: 'fail', message: 'Request Bodies Required' });
    }

    if (item_type !== 1 && !doneStatus && note_content === undefined) {
      return res.status(404).json({ status: 'fail', message: 'Invaild Request Bodies', detail: 'Only change Todo to Note, item_type must be 1' });
    }

    if (note_content !== undefined) {
      await Todo.updateTodo(user_id, group_id, item_id, item_type, doneStatus, note_content);
      return res.status(200).json({ status: 'success', message: 'Todo content changed successfully' });
    }

    if (item_type === 1) {
      await Todo.updateTodo(user_id, group_id, item_id, item_type, doneStatus, note_content);
      return res.status(200).json({ status: 'success', message: 'Todo changed to Note successfully' });
    }

    if (doneStatus === true || doneStatus === false) {
      await Todo.updateTodo(user_id, group_id, item_id, item_type, doneStatus, note_content);
      return res.status(200).json({ status: 'success', message: 'Todo status updated successfully' });
    }
    return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

module.exports = {
  addTab, updateTab, addNote, updateNote, updateTodo,
};
