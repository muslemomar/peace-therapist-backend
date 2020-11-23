const router = require('express').Router();
const routerController = require('./../controllers/auth');
const validateBody = require('./../middleware/validateBody');
const {auth, authWithoutVerification} = require('./../middleware/auth');
const {User, UserSession} = require('./../models/User');

router.post('/register', validateBody(User, null, ['password']), routerController.registerUser);

router.post('/logout', authWithoutVerification, routerController.logout);

router.post('/login', validateBody(User, ['email', 'password', 'phoneNumber'], ['password']), routerController.login);

module.exports = router;
