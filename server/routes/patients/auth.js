const router = require('express').Router();
const routerController = require('../../controllers/patients/auth');
const validateBody = require('../../middleware/validateBody');
const {auth, authWithoutVerification} = require('../../middleware/auth');
const {Patient} = require('../../models/Patient');
const {upload} = require('../../utils/general');

router.post('/register', upload.single('profilePic'), validateBody(Patient, null, ['password']), routerController.registerUser);

router.post('/logout', authWithoutVerification, routerController.logout);

router.post('/login', validateBody(Patient, ['email', 'password', 'phoneNumber'], ['password']), routerController.login);

module.exports = router;
