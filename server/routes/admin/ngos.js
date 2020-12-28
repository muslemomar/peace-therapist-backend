const router = require('express').Router();
const routerController = require('./../../controllers/admin/ngos');
const validateBody = require('./../../middleware/validateBody');
const {requireId} = require('../../middleware/general');
const {NGO} = require('./../../models/NGO');

router.get('/', routerController.getNGOs);

router.get('/:id', requireId, routerController.getOneNGO);

router.post('/', validateBody(NGO), routerController.createNGO);

router.patch(
    '/:id',
    requireId,
    validateBody(NGO),
    routerController.updateNGO
);

router.delete('/:id', requireId, routerController.deleteNGO);

module.exports = router;
