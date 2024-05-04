const router = require('express').Router();
const controller = require('../controllers/group');
const { validateGroupDataTypes } = require('../validations/group');
const { validateItemDataTypes } = require('../validations/item');
const { validatePositionDataTypes } = require('../validations/position');
const validateDataTypes = require('../validations/data');

router.get('/', controller.getGroups);
router.post('/', validateDataTypes, controller.createGroup);
router.patch('/:group_id', validateDataTypes, controller.updateGroup);
router.delete('/:group_id', controller.deleteGroup);

module.exports = router;
