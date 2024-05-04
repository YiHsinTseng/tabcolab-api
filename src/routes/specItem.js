const router = require('express').Router();

const { validateItemDataTypes } = require('../validations/item');
const controller = require('../controllers/specItem');

router.post('/tabs', validateItemDataTypes, controller.addTab);
router.patch('/tabs/:item_id', validateItemDataTypes, controller.updateTab);
router.post('/notes', validateItemDataTypes, controller.addNote);
router.patch('/notes/:item_id', validateItemDataTypes, controller.updateNote);
router.patch('/todos/:item_id', validateItemDataTypes, controller.updateTodo);

module.exports = router;
