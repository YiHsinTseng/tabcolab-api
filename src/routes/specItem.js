const router = require('express').Router();

const { validateItemDataTypes } = require('../validations/item');
const controller = require('../controllers/specItem');

router.post('/:group_id/tabs', validateItemDataTypes, controller.addTab);
router.patch('/:group_id/tabs/:item_id', validateItemDataTypes, controller.updateTab);
router.post('/:group_id/notes', validateItemDataTypes, controller.addNote);
router.patch('/:group_id/notes/:item_id', validateItemDataTypes, controller.updateNote);
router.patch('/:group_id/todos/:item_id', validateItemDataTypes, controller.updateTodo);

module.exports = router;
