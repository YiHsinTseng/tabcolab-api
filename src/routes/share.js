const router = require('express').Router();
const { authenticateJwt,authenticateAdmin } = require('../middlewares/authenticate');
const controller = require('../controllers/share');


// router.get('/sharing/:id',controller.viewHtml)
router.delete('/sharing',controller.deleteHtml)

// JWT authentication middleware
router.use(authenticateJwt);
router.post('/sharing',controller.shareHtml)

module.exports = router;