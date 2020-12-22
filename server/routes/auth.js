const router = require('express').Router();
const routerController = require('./../controllers/auth');
const validateBody = require('./../middleware/validateBody');
const {auth, authWithoutVerification} = require('./../middleware/auth');
const {User, UserSession} = require('./../models/User');
const {upload} = require('./../utils/general');

router.post('/register', upload.fields([
    {name: 'profilePic', maxCount: 1},
    {name: 'cv', maxCount: 1},
    {name: 'diploma', maxCount: 1},
]), validateBody(User, null, ['password']), routerController.registerUser);

router.post('/logout', authWithoutVerification, routerController.logout);

router.post('/login', validateBody(User, ['email', 'password', 'phoneNumber', 'userType'], ['password']), routerController.login);

module.exports = router;
