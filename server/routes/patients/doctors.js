const router = require('express').Router();
const routerController = require('../../controllers/patients/doctors');
const validateBody = require('../../middleware/validateBody');
const {requireId} = require('../../middleware/general');
const {upload} = require('../../utils/general');

router.get('/', routerController.getDoctors);

// router.post('/:id', auth, routerController.getAppointment);

module.exports = router;
