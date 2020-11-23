const router = require('express').Router();
const routerController = require('./../../controllers/admin/dashboard');

router.get('/', routerController.getDashboard);

module.exports = router;
