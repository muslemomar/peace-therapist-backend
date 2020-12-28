const router = require('express').Router();
const routerController = require('./../controllers/users');
const validateBody = require('./../middleware/validateBody');
const {requireId} = require('./../middleware/general');
const {auth, authWithoutVerification} = require('./../middleware/auth');

router.post('/sendPhoneVerifyCode', authWithoutVerification, routerController.sendPhoneVerificationCode);

router.post('/verifyPhone', authWithoutVerification, routerController.verifyPhone);

router.post('/sendEmailVerifyCode', authWithoutVerification, routerController.sendEmailVerificationCode);

router.post('/verifyEmail', authWithoutVerification, routerController.verifyEmail);

// router.post('/forgot-password', validateBody(User, null, null, 'forgot-password'), routerController.forgotPassword);

router.get('/reset/:token', routerController.getPasswordResetPage);

router.post( '/reset/:token', routerController.processPasswordResetToken);

router.use('/profile', require('./userProfile'));

module.exports = router;
