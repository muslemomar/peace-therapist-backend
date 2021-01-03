const passport = require('passport');
const {UserSession} = require('../models/UserSession');
const {Doctor} = require('../models/Doctor');
const {Patient} = require('../models/Patient');
const {Admin} = require('../models/CmsUser');
const {genRes} = require('./../utils/general');
const {ResError, Forbidden, UnprocessableEntity} = require('./../utils/error');
const {t} = require('localizify');

exports.adminAuth = (req, res, next) => {

    if (!req.isAuthenticated()) {
        res.status(401).send()
    } else {
        next();
    }
};

const auth = (req, res, next, passWithoutVerification, validUserType) => {
    const token = req.headers.authorization;

    req.userType = req.headers.usertype;
    const validUserTypes = validUserType ? [validUserType] : [Doctor.modelName, Patient.modelName];
    if (!validUserTypes.includes(req.userType)) {
        return next(new UnprocessableEntity(`"userType" header field is not valid (${validUserTypes.join(',')})`));
    }

    passport.authenticate('jwt', {session: false}, function (err, user, info) {
        if (err) return next(err);

        if (!user) {
            return next(new ResError(undefined, 401));
        }

        UserSession.findOne({
            userId: user._id,
            userType: req.userType,
            token: token
        }).then((session) => {

            if (!session) {
                return next(new ResError(undefined, 401));
            }

            if (!passWithoutVerification) {
                const isAccountVerified = user.isEmailVerified && user.isPhoneVerified;
                if (!isAccountVerified) {

                    const isDoctor = req.userType === Doctor.modelName;
                    if (isDoctor) {
                        if (!user.isEmailVerified && !user.isPhoneVerified)
                            return next(new Forbidden("Please verify your email and phone number to use the app"));
                        if (!user.isEmailVerified)
                            return next(new Forbidden("Please verify your email to use the app"));
                        if (!user.isPhoneVerified)
                            return next(new Forbidden("Please verify your phone to use the app"));

                    } else {
                        if (!user.isEmailVerified) return next(new Forbidden("Please verify your email to use the app"));
                        if (!user.isPhoneVerified) return next(new Forbidden("Please verify your phone to use the app"));
                    }

                }
            }

            req.logIn(user, function (err) {
                if (err) return next(err);

                req.user = user;
                req.token = token;

                // assign doctor types
                req.isDoctor = req.userType === Doctor.modelName;
                if (req.isDoctor) {
                    req.isNGODoctor = Doctor.TYPES.NGO === req.user.type;
                    req.isRegularDoctor = Doctor.TYPES.REGULAR === req.user.type;
                }

                //assign patient types
                req.isPatient = req.userType === Patient.modelName;
                if (req.isPatient) {
                    req.isRefugeePatient = Patient.TYPES.REFUGEE === req.user.type;
                    req.isRegularPatient = Patient.TYPES.REGULAR === req.user.type;
                }
                return next();
            });

        }).catch((err) => {
            return next(err);
        });


    })(req, res, next);
};

exports.auth = (req, res, next) => {
    return auth(req, res, next);
};

exports.onlyDoctorsAuth = (req, res, next) => {
    return auth(req, res, next, null, Doctor.modelName);
};

exports.onlyPatientsAuth = (req, res, next) => {
    return auth(req, res, next, null, Patient.modelName);
};

exports.authWithoutVerification = (req, res, next) => {
    return auth(req, res, next, true);
};
