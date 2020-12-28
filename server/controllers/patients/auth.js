const {t} = require('localizify');
const _ = require('lodash');
const moment = require('moment');
const winston = require('winston');

const {Patient} = require('../../models/Patient');
const {NGO} = require('../../models/NGO');

const {UnprocessableEntity, NotFound} = require('../../utils/error');
const {sendEmailVerifyCode} = require('../../helpers/mailer');
const {upload} = require('../../utils/general');
const {uploadImage, uploadFile} = require('../../helpers/uploader');
const authHelper = require('../../helpers/auth');
const {validateImage} = require('../../utils/validators');

exports.registerUser = async (req, res, next) => {

    if (!req.body.email && !req.body.phoneNumber) {
        return next(new UnprocessableEntity("One of 'email' or 'phoneNumber' is required"));
    }

    if (req.body.email && req.body.phoneNumber) {
        return next(new UnprocessableEntity("Please enter only one of 'email' or 'phoneNumber'"));
    }

    if (req.body.email) {
        delete req.body.phoneNumber;
        if (await Patient.countDocuments({email: req.body.email})) {
            return next(new UnprocessableEntity("An account with the same email already exists"));
        }

    } else {
        delete req.body.email;
        if (await Patient.countDocuments({phoneNumber: req.body.phoneNumber})) {
            return next(new UnprocessableEntity("An account with the same phone number already exists"));
        }
    }

    let profilePic = req.file;
    if (profilePic) {
        if (!validateImage(profilePic)) throw new UnprocessableEntity('"profilePic" is not a valid image');
        req.body.profilePic = (await uploadImage(profilePic)).Location;
    }

    let user = await Patient.create(req.body);

    const token = await user.generateAuthToken();
    res.header('Authorization', token);
    res.sendData({
        message: `The account was created successfully, please check your ${req.body.email ? 'email' : 'phone'} to verify your account`,
        user: user
    });
};

exports.logout = async (req, res) => {

    await authHelper.logoutUser(req);
    res.sendData();
};

exports.login = async (req, res, next) => {

    if (!req.body.email && !req.body.phoneNumber) {
        return next(new UnprocessableEntity("One of 'email' or 'phoneNumber' is required"));
    }

    if (req.body.email && req.body.phoneNumber) {
        return next(new UnprocessableEntity("Please enter only one of 'email' or 'phoneNumber'"));
    }

    if (req.body.email) {
        delete req.body.phoneNumber;
    } else {
        delete req.body.email;
    }

    let user = await Patient
        .findOne({})
        .byCredentials(req.body.email, req.body.phoneNumber, req.body.password);

    if (!user) return res.sendError('Incorrect credentials', 422);

    const token = await user.generateAuthToken();
    res.header('Authorization', token);

    res.sendData(user);
};
