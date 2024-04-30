const router = require('express').Router();
const controller = require('../../controllers/item');
const { validateItemDataTypes } = require('../../validations/validation-item');

router.get('/groups/items/search', validateItemDataTypes, controller.searchItemsInGroups);
router.patch('/groups/:group_id/items/:item_id', validateItemDataTypes, controller.moveItem);
router.delete('/groups/:group_id/items/:item_id', validateItemDataTypes, controller.deleteItem);

module.exports = router;
