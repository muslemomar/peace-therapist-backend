const router = require('express').Router();
const {adminAuth} = require('./../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/dashboard', adminAuth, require('./dashboard'));
router.use('/users', adminAuth, require('./users'));
router.use('/profile', adminAuth, require('./profile'));

module.exports = router;
