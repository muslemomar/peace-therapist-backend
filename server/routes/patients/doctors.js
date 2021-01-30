const router = require('express').Router();
const {Appointment} = require('../../models/Appointment');
const routerController = require('../../controllers/patients/doctors');
const validateBody = require('../../middleware/validateBody');
const {requireId} = require('../../middleware/general');
const {upload} = require('../../utils/general');

router.get('/', routerController.getDoctors);

router.post('/:id/first-appointment', requireId, validateBody(Appointment, ['startDate']), routerController.createAppointment);

module.exports = router;
