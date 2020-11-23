const router = require('express').Router();
const routerController = require('./../controllers/uploads');
const validateBody = require('./../middleware/validateBody');
const {requireId} = require('./../middleware/general');
const {User} = require('./../models/User');
const {auth} = require('./../middleware/auth');
const {upload} = require('./../helpers/uploader');

router.post('/images', auth, upload.array('images', 5), routerController.uploadImages);

module.exports = router;
