const router = require('express').Router();
const routerController = require('./../../controllers/admin/users');
const validateBody = require('./../../middleware/validateBody');
const {requireId} = require('../../middleware/general');
const {User} = require('./../../models/User');

router.get('/', routerController.getUsers);

router.get('/:id', requireId, routerController.getOneUser);

router.delete('/:id', requireId, routerController.deleteUser);

router.patch(
    '/:id',
    requireId,
    validateBody(User, ['nickName', 'email', 'phoneNumber', 'password', 'isVerified'], ['isVerified']),
    routerController.updateUser
);

module.exports = router;
