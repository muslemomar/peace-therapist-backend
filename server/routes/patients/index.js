const router = require('express').Router();

const {onlyPatientsAuth: auth} = require('../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/doctors', auth, require('./doctors'));
router.use('/appointments', auth, require('./appointments'));

module.exports = router;
