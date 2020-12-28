const router = require('express').Router();
const routerController = require('../../controllers/patients/doctors');
const validateBody = require('../../middleware/validateBody');
const {requireId} = require('../../middleware/general');
const {auth} = require('../../middleware/auth');
const {upload} = require('../../utils/general');

router.get('/', auth, routerController.getDoctors);

module.exports = router;
