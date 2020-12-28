const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

const {NGO} = require('../models/NGO');

const {UnprocessableEntity, Forbidden, NotFound} = require('../utils/error');
const {uploadImage} = require('../helpers/uploader');
const {validateImage} = require('../utils/validators');

exports.getNgos = async (req, res) => {

    const docs = await NGO
        .find({})
        .skip(req.offset)
        .limit(req.limit);

    res.sendData(docs);
};
