const router = require('express').Router();
const routerController = require('../../controllers/doctors/patients');
const validateBody = require('./../../middleware/validateBody');
const {authWithoutVerification} = require('../../middleware/auth');
const {requireId} = require('../../middleware/general');
const {Program} = require('../../models/Program');

router.post('/:id/programs', requireId, validateBody(Program), routerController.createProgram);

module.exports = router;
