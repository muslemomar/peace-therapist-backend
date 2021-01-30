const router = require('express').Router();

const {onlyDoctorsAuth: auth} = require('../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/patients', auth, require('./patients'));

module.exports = router;
