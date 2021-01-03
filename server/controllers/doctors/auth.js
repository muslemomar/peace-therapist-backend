const {t} = require('localizify');
const _ = require('lodash');
const moment = require('moment');
const winston = require('winston');

const {Doctor} = require('../../models/Doctor');
const {UserSession} = require('../../models/UserSession');
const {NGO} = require('../../models/NGO');

const {UnprocessableEntity, NotFound} = require('../../utils/error');
const {sendEmailVerifyCode} = require('../../helpers/mailer');
const {upload} = require('../../utils/general');
const {uploadImage, uploadFile} = require('../../helpers/uploader');
const authHelper = require('../../helpers/auth');
const {validateImage, validatePdf} = require('../../utils/validators');

exports.registerUser = async (req, res, next) => {

    if (req.body.email) {
        if (await Doctor.countDocuments({email: req.body.email})) {
            return next(new UnprocessableEntity("An account with the same email already exists"));
        }
    }

    if (req.body.phoneNumber) {
        if (await Doctor.countDocuments({phoneNumber: req.body.phoneNumber})) {
            return next(new UnprocessableEntity("An account with the same phone number already exists"));
        }
    }

    if (req.body.ngo) {
        const ngo = await NGO.findOne({_id: req.body.ngo}, {_id: 1}).lean();
        if (!ngo) throw new NotFound('No such an NGO');
    }

    async function parseFiles() {

        /* Files parsing and fields checking */
        let {profilePic, cv, diploma} = req.files || {profilePic: [], cv: [], diploma: []};

        profilePic = Array.isArray(profilePic) ? profilePic[0] : null;
        cv = Array.isArray(cv) ? cv[0] : null;
        diploma = Array.isArray(diploma) ? diploma[0] : null;

        const isRegularDoctor = req.body.type === Doctor.TYPES.REGULAR;
        const isNgoDoctor = req.body.type === Doctor.TYPES.NGO;

        const fieldsCheckErrors = [];

        /*
        REGULAR DOCTOR -> {
            cv: required,
            diploma: required,
            profilePic: required.
        }

        NGO DOCTOR -> {
            cv: optional,
            diploma: disallowed,
            profilePic: required.
        }
        */

        if (!profilePic) fieldsCheckErrors.push('"profilePic" is required');
        if (isRegularDoctor && !cv) fieldsCheckErrors.push('"cv" is required');
        if (isRegularDoctor && !diploma) fieldsCheckErrors.push('"diploma" is required');
        if (isNgoDoctor && diploma) fieldsCheckErrors.push('"diploma" is not allowed');

        return {
            errors: fieldsCheckErrors,
            profilePic,
            cv,
            diploma
        };
    }


    const {errors, diploma, cv, profilePic} = await parseFiles();
    if (errors.length) return res.sendErrors(errors);

    await (async function checkFileTypesAndUpload() {

        /* Verify file types */

        if (!validateImage(profilePic)) throw new UnprocessableEntity('"profilePic" is not a valid image');

        if (cv) {
            if (!validatePdf(cv)) throw new UnprocessableEntity('"cv" is not a valid pdf file');
        }

        if (diploma) {
            if (!validatePdf(diploma)) throw new UnprocessableEntity('"diploma" is not a valid pdf file');
        }

        /* Upload files */

        req.body.profilePic = (await uploadImage(profilePic)).Location;

        if (cv) {
            req.body.cv = (await uploadFile(cv, true)).Location;
        }

        if (diploma) {
            req.body.diploma = (await uploadFile(diploma, true)).Location;
        }

    })();

    let user = await Doctor.create(req.body);

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

    let user = await Doctor
        .findOne({})
        .byCredentials(req.body.email, req.body.phoneNumber, req.body.password);

    if (!user) return res.sendError('Incorrect credentials', 422);

    const token = await user.generateAuthToken();
    res.header('Authorization', token);

    res.sendData(user);
};
