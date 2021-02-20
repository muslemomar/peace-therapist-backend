const router = require('express').Router();
const routerController = require('../../controllers/doctors/appoinments');
const validateBody = require('./../../middleware/validateBody');
const {authWithoutVerification} = require('../../middleware/auth');
const {requireId} = require('../../middleware/general');

router.get('/', routerController.listAppointments);

module.exports = router;
