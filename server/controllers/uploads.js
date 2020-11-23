const {UserSession, User} = require('../models/User');
const _ = require('lodash');
const moment = require('moment');
const {UnprocessableEntity, Forbidden, NotFound} = require('../utils/error');
const {uploadImages} = require('../helpers/uploader');
const {validateImage} = require('../utils/validators');

exports.uploadImages = async (req, res) => {

    let images = req.files;

    if (!Array.isArray(images) || !images.length || !validateImage(images))
        throw new UnprocessableEntity('Invalid images');

    images = (await uploadImages(images));

    res.sendData(images.map(i => i.Location));
};
