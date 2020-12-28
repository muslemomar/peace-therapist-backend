const router = require('express').Router();
const routerController = require('../../controllers/admin/doctors');
const validateBody = require('../../middleware/validateBody');
const {requireId} = require('../../middleware/general');
const {Doctor} = require('../../models/Doctor');

router.get('/', routerController.getDoctors);

router.get('/:id', requireId, routerController.getOneDoctor);

router.patch(
    '/:id',
    requireId,
    validateBody(Doctor, ['isDoctorVerified'], null, 'u'),
    routerController.updateDoctor
);

/*
router.get('/:id', requireId, routerController.getOneDoctor);

router.delete('/:id', requireId, routerController.deleteDoctor);*/

module.exports = router;
