const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');

const {UserSession} = require('../models/UserSession');
const {Doctor} = require('../models/Doctor');
const {Patient} = require('../models/Patient');

const {UnprocessableEntity, Forbidden, NotFound} = require('../utils/error');
const {uploadImage} = require('../helpers/uploader');
const {validateImage} = require('../utils/validators');

exports.getUserProfile = async (req, res) => {
    res.sendData(req.user);
};

/*
exports.updateUserProfile = async (req, res) => {

    const doc = await mongoose
        .model(req.user.userType)
        .findOne({_id: req.user._id});


    if (req.file) {
        if (!validateImage(req.file)) throw new UnprocessableEntity('Invalid image');
        req.body.profilePic = (await uploadImage(req.file)).Location;
    }

    doc.set(req.body);
    await doc.save();

    res.sendData(doc);
};
*/
