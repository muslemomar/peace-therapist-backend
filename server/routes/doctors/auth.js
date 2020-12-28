const router = require('express').Router();
const routerController = require('../../controllers/doctors/auth');
const validateBody = require('./../../middleware/validateBody');
const {authWithoutVerification} = require('../../middleware/auth');
const {Doctor} = require('../../models/Doctor');
const {upload} = require('../../utils/general');

router.post('/register', upload.fields([
    {name: 'profilePic', maxCount: 1},
    {name: 'cv', maxCount: 1},
    {name: 'diploma', maxCount: 1},
]), validateBody(Doctor, null, ['password']), routerController.registerUser);

router.post('/logout', authWithoutVerification, routerController.logout);

router.post('/login', validateBody(Doctor, ['email', 'password', 'phoneNumber'], ['password']), routerController.login);

module.exports = router;
