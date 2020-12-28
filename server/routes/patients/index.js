const router = require('express').Router();

const {onlyPatientsAuth} = require('../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/doctors', onlyPatientsAuth, require('./doctors'));

module.exports = router;
