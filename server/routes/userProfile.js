const router = require('express').Router();
const routerController = require('./../controllers/userProfile');
const validateBody = require('./../middleware/validateBody');
const {requireId} = require('./../middleware/general');
const {User} = require('./../models/User');
const {auth} = require('./../middleware/auth');
const {upload} = require('./../utils/general');

router.get('/', auth, routerController.getUserProfile);

router.patch(
    '/',
    upload.single('profilePic'),
    validateBody(User, null, null, 'u'),
    auth,
    routerController.updateUserProfile
);

module.exports = router;
