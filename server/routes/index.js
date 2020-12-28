const router = require('express').Router();

router.use('/doctors', require('./doctors'));
router.use('/patients', require('./patients'));
router.use('/users', require('./users'));
router.use('/ngos', require('./ngos'));

router.use('/admin', require('./admin'));

module.exports = router;
