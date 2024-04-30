const router = require('express').Router();

const { validateItemDataTypes } = require('../validations/item');
const controller = require('../controllers/specItem');

router.post('/groups/:group_id/tabs', validateItemDataTypes, controller.addTab);
router.patch('/groups/:group_id/tabs/:item_id', validateItemDataTypes, controller.updateTab);
router.post('/groups/:group_id/notes', validateItemDataTypes, controller.addNote);
router.patch('/groups/:group_id/notes/:item_id', validateItemDataTypes, controller.updateNote);
router.patch('/groups/:group_id/todos/:item_id', validateItemDataTypes, controller.updateTodo);

module.exports = router;
