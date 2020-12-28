const router = require('express').Router();
const {adminAuth} = require('./../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/dashboard', adminAuth, require('./dashboard'));
router.use('/profile', adminAuth, require('./profile'));
router.use('/doctors', adminAuth, require('./doctors'));
router.use('/ngos', adminAuth, require('./ngos'));

module.exports = router;
