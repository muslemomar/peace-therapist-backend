const router = require('express').Router();
const routerController = require('./../../controllers/admin/profile');
const validateBody = require('../../middleware/validateBody');
const {adminAuth} = require('../../middleware/auth');
const {CmsUser} = require('../../models/CmsUser');

router.get('/', adminAuth, routerController.getProfile);

router.patch(
    '/',
    adminAuth,
    validateBody(CmsUser, ['username', 'nickName', 'oldPassword', 'newPassword']),
    routerController.updateProfile
);

module.exports = router;
