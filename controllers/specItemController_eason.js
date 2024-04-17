const jsonServer = require('json-server');
// const db = jsonServer.router('./mock-server/db.json').db;
const config = require('../configs/config.json');

const env = process.env.NODE_ENV || 'development';
const { db } = jsonServer.router(config[env].db.path);

const { generateItemId } = require('../models/mock-server/item'); // Import your utility module

const addTab = (req, res) => {
  const { group_id } = req.params;

  const { user_id } = req.user;
  const group = db.get('user_groups').find({ user_id }).get('groups').find({ group_id })
    .value();

  if (!group) {
    return res.status(404).json({ status: 'fail', message: 'Group not found' });
  }
  const {
    browserTab_favIconURL, browserTab_title, browserTab_url, targetItem_position,
    browserTab_id,
    browserTab_index,
    browserTab_active,
    browserTab_status,
    windowId,
  } = req.body;
  if (group_id && browserTab_favIconURL && browserTab_title && browserTab_url
    && browserTab_id != undefined && browserTab_index != undefined && browserTab_active != undefined && browserTab_status && windowId != undefined
    && targetItem_position != undefined) {
    const newTab = {
      item_id: generateItemId(),
      item_type: 0, // Assuming 0 represents a tab
      browserTab_favIconURL,
      browserTab_title,
      browserTab_url,
      browserTab_id,
      browserTab_index,
      browserTab_active,
      browserTab_status,
      windowId,
    };

    // Ensure that targetItem_position is within a valid range
    if (targetItem_position >= 0 && targetItem_position <= group.items.length) {
      // Use splice to insert newTab at the specified position
      group.items.splice(targetItem_position, 0, newTab);
    } else {
      // If the target position is out of the array's range, newTab will be inserted at the end of the array by default
      group.items.push(newTab);
    }
    db.write();

    return res.status(201).json({ status: 'success', message: 'New tab added to group successfully', item_id: newTab.item_id });
  }

  return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
};

const updateTab = (req, res) => {
  const { group_id, item_id } = req.params;
  // const group = db.get('groups').find({ group_id }).value();
  const { user_id } = req.user;
  const group = db.get('user_groups').find({ user_id }).get('groups').find({ group_id })
    .value();

  if (!group) {
    return res.status(404).json({ status: 'fail', message: 'Group not found' });
  }
  const tab = group.items.find((item) => item.item_id === item_id && item.item_type === 0);
  if (!tab) {
    return res.status(404).json({ status: 'fail', message: 'Tab not found in group' });
  }

  let {
    note_content,
    // , note_bgColor
  } = req.body;
  // 将 note_content 的值转换为字符串，如果是数字则保持原样，如果是其他类型则转换为字符串

  if (Object.keys(req.body).length > 1) {
    return res.status(404).json({ status: 'fail', message: 'Unexpected Additional Parameters' });
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(404).json({ status: 'fail', message: 'Request Bodies Required' });
  }

  if (note_content === undefined && Object.keys(req.body).length === 1) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Bodies Required', detail: 'Missing note_content field ' });
  }

  note_content = String(note_content);

  if (group_id && item_id && note_content !== undefined
    // && note_bgColor !== undefined
  ) {
    tab.note_content = note_content;
    // tab.note_bgColor = note_bgColor || '#ffffff';
    /**
             * @openapi
             * components:
             *   requestBodies:
             *     updateTab:
             *       type: object
             *       properties:
             *         note_content:
             *           $ref: '#/components/schemas/Tab/properties/note_content'
             */
    db.write();
    return res.status(201).json({ status: 'success', message: 'Note added to tab successfully', note_content: tab.note_content });
  }
  return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
};

const addNote = (req, res) => {
  const { group_id } = req.params;
  // const group = db.get('groups').find({ group_id }).value();
  const { user_id } = req.user;
  const group = db.get('user_groups').find({ user_id }).get('groups').find({ group_id })
    .value();

  if (!group) {
    return res.status(404).json({ status: 'fail', message: 'Group not found' });
  } if (!group.items) {
    group.items = [];
  }

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
    const newNote = {
      item_id: generateItemId(),
      item_type: 1, // Assuming 1 represents a note
      note_content,
      note_bgColor: note_bgColor || '#ffffff',
    };
    /**
             * @openapi
             * components:
             *   requestBodies:
             *     addNote:
             *       description: Create a note in group.
             *       type: object
             *       required:
             *         - note_content
             *       properties:
             *         note_content:
             *           type: string
             *         note_bgColor:
             *           type: string
             *       example:
             *         note_content: ''
             *         note_bgColor: '#ffffff'
             */
    group.items.push(newNote);
    db.write();
    return res.status(201).json({ status: 'success', message: 'Note added to group successfully', item_id: newNote.item_id });
  }
  return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
};

const updateNote = (req, res) => {
  const { group_id, item_id } = req.params;
  // const groups = db.get('groups').value();
  const { user_id } = req.user;
  const groups = db.get('user_groups').find({ user_id }).get('groups').value();

  const group = groups.find((group) => group.group_id === group_id);
  if (!group) {
    return res.status(404).json({ status: 'fail', message: 'Group not found' });
  }

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

  const noteIndex = group.items.findIndex((item) => item.item_id === item_id && item.item_type === 1);
  if (noteIndex === -1) {
    return res.status(404).json({ status: 'fail', message: 'Note not found in group' });
  }

  if (group && noteIndex !== undefined && note_content !== undefined) {
    group.items[noteIndex].note_content = note_content;
    /**
             * @openapi
             * components:
             *   requestBodies:
             *     NoteChangeContent:
             *       description: Change Note Content.
             *       type: object
             *       properties:
             *         note_content:
             *           type: string
             */
    db.write();
    return res.status(200).json({ status: 'success', message: 'Note content changed successfully' });
  }

  if (group && noteIndex !== undefined && item_type === 2) {
    group.items[noteIndex].item_type = 2;
    group.items[noteIndex].doneStatus = false;

    /**
             * @openapi
             * components:
             *   requestBodies:
             *     NoteChangetoTodo:
             *       description: Convert a tab to a todo.
             *       type: object
             *       properties:
             *         item_type:
             *           type: integer
             *           enum: [2]
             */
    db.write();
    return res.status(200).json({ status: 'success', message: 'Note changed to todo successfully' });
  }
  return res.status(400).json({ status: 'fail', message: 'Invalid request body' });
};

const updateTodo = (req, res) => {
  const { group_id, item_id } = req.params;
  // const groups = db.get('groups').value();
  const { user_id } = req.user;
  const groups = db.get('user_groups').find({ user_id }).get('groups').value();
  const group = groups.find((group) => group.group_id === group_id);
  if (!group) {
    return res.status(404).json({ status: 'fail', message: 'Group not found' });
  }

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

  const todoIndex = group.items.findIndex((item) => item.item_id === item_id && item.item_type === 2);// NOTE item_type  req body string 也會給過(js問題)要用===
  if (todoIndex === -1) {
    return res.status(404).json({ status: 'fail', message: 'Todo not found in group' });
  }

  if (group && todoIndex !== undefined && note_content !== undefined) {
    group.items[todoIndex].note_content = note_content;
    /**
             * @openapi
             * components:
             *   requestBodies:
             *     TodoContentUpdate:
             *       description: Update Todo Content.
             *       type: object
             *       properties:
             *         note_content:
             *           type: string
             */
    db.write();
    return res.status(200).json({ status: 'success', message: 'Todo content changed successfully' });
  } if (group && todoIndex !== undefined && item_type === 1) {
    group.items[todoIndex].item_type = 1;
    delete group.items[todoIndex].doneStatus;
    /**
            * @openapi
            * components:
            *   requestBodies:
            *     TodoChangetoNote:
            *       description: Convert a todo to a note in an existing group.
            *       type: object
            *       properties:
            *         item_type:
            *           type: integer
            *           enum: [1]
            */
    db.write();
    return res.status(200).json({ status: 'success', message: 'Todo changed to Note successfully' });
  } if (group && todoIndex !== undefined && (doneStatus === true || doneStatus === false)) {
    group.items[todoIndex].doneStatus = doneStatus;
    /**
            * @openapi
            * components:
            *   requestBodies:
            *     TodoStatusUpdate:
            *       description: Check/uncheck a todo in an existing group.
            *       type: object
            *       properties:
            *         doneStatus:
            *           type: boolean
            */
    db.write();
    return res.status(200).json({ status: 'success', message: 'Todo status updated successfully' });
  }
  return res.status(400).json({ status: 'fail', message: 'Invalid request body' });

  // Update the todo's doneStatus
};

module.exports = {
  addTab, updateTab, addNote, updateNote, updateTodo,
};
