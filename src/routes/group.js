const router = require('express').Router();
const controller = require('../controllers/group');
const { validateGroupDataTypes } = require('../validations/group');
const { validateItemDataTypes } = require('../validations/item');
const { validatePositionDataTypes } = require('../validations/position');

router.get('/', controller.getGroups);
router.post('/', validateGroupDataTypes, validateItemDataTypes, controller.createGroup);
router.patch('/:group_id', validateGroupDataTypes, validatePositionDataTypes, controller.updateGroup);
router.delete('/:group_id', controller.deleteGroup);

module.exports = router;
