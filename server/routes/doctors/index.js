const router = require('express').Router();

const {onlyDoctorsAuth} = require('../../middleware/auth');

router.use('/auth', require('./auth'));

module.exports = router;
