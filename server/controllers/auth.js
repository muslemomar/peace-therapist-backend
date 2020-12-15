const {UserSession, User} = require('../models/User');
const {t} = require('localizify');
const _ = require('lodash');
const moment = require('moment');
const winston = require('winston');
const {UnprocessableEntity} = require('../utils/error');
const {sendEmailVerifyCode} = require('../helpers/mailer');
const {generateVerificationToken} = require('../utils/auth');
const {upload} = require('./../utils/general');
const {uploadImage, validateImage} = require('./../utils/general');

exports.registerUser = async (req, res, next) => {

    if (!req.body.email && !req.body.phoneNumber) {
        return next(new UnprocessableEntity("One of 'email' or 'phoneNumber' is required"));
    }

    if (req.body.email && req.body.phoneNumber) {
        return next(new UnprocessableEntity("Please enter only one of 'email' or 'phoneNumber'"));
    }

    if (req.body.email) {
        delete req.body.phoneNumber;
        if (await User.countDocuments({email: req.body.email})) {
            return next(new UnprocessableEntity("An account with the same email already exists"));
        }

    } else {
        delete req.body.email;
        if (await User.countDocuments({phoneNumber: req.body.phoneNumber})) {
            return next(new UnprocessableEntity("An account with the same phone number already exists"));
        }
    }

    if (req.file) {
        if (!validateImage(req.file)) throw new UnprocessableEntity('Invalid image');
        req.body.profilePic = (await uploadImage(req.file)).Location;
    }

    let user = await User.create(req.body);

    const token = await user.generateAuthToken();
    res.header('Authorization', token);

    if (req.body.email) {

        res.sendData({
            message: 'The account was created successfully, please check your email to verify your account',
            user: user
        });
    } else {
        res.sendData({
            message: 'The account was created successfully, please check your phone to verify your account',
            user: user
        });
    }
};

exports.logout = async (req, res) => {

    await UserSession.deleteOne({token: req.token});
    req.logout();

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

    let user = await User
        .findOne({})
        .populate('storeId', '_id')
        .byCredentials(req.body.email, req.body.phoneNumber, req.body.password);

    if(!user) return res.sendError('Incorrect credentials', 422);

    const token = await user.generateAuthToken();
    res.header('Authorization', token);

    res.sendData(user);
};
