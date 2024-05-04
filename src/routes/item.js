const router = require('express').Router();
const controller = require('../controllers/item');
const { validateItemDataTypes } = require('../validations/item');

router.get('/items/search', validateItemDataTypes, controller.searchItemsInGroups);
router.patch('/:group_id/items/:item_id', validateItemDataTypes, controller.moveItem);
router.delete('/:group_id/items/:item_id', validateItemDataTypes, controller.deleteItem);

module.exports = router;
