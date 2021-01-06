const router = require('express').Router();

const {onlyPatientsAuth: auth} = require('../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/doctors', auth, require('./doctors'));

module.exports = router;
