const router = require('express').Router();
const routerController = require('./../../controllers/admin/auth');
const validateBody = require('./../../middleware/validateBody');
const {adminAuth} = require('./../../middleware/auth');
const {CmsUser} = require('./../../models/CmsUser');

router.post('/login', validateBody(CmsUser, ['username', 'password']), routerController.login);

router.post('/logout', adminAuth, routerController.logout);

module.exports = router;
