const {UserSession, User} = require('../models/User');
const _ = require('lodash');
const moment = require('moment');
const {UnprocessableEntity, Forbidden, NotFound} = require('../utils/error');
const {uploadImage} = require('../helpers/uploader');
const {validateImage} = require('../utils/validators');

exports.getUserProfile = async (req, res) => {

    await req.user
        .populate('storeId', '_id title logo')
        .execPopulate();

    res.sendData(req.user);
};

exports.updateUserProfile = async (req, res) => {

    const user = await User.findOne({_id: req.user._id});

    if (req.file) {
        if (!validateImage(req.file)) throw new UnprocessableEntity('Invalid image');
        req.body.profilePic = (await uploadImage(req.file)).Location;
    }

    user.set(req.body);
    await user.save();

    res.sendData(user);
};
