const router = require('express').Router();
const {auth} = require('./../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));

router.use('/admin', require('./admin'));

module.exports = router;
