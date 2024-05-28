const router = require('express').Router();
const controller = require('../controllers/item');
const { validateItemDataTypes } = require('../validations/item');
const { validateGroupDataTypes } = require('../validations/group');

router.get('/items/search', controller.searchItemsInGroups);
router.patch('/:group_id/items/:item_id', validateGroupDataTypes, validateItemDataTypes, controller.moveItem);
router.delete('/:group_id/items/:item_id', controller.deleteItem);

module.exports = router;
