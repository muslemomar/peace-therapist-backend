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

const auth = (req, res, next, passWithoutVerification) => {
    const token = req.headers.authorization;

    req.userType = req.headers.usertype;
    if (![Doctor.modelName, Patient.modelName].includes(req.userType)) {
        return next(new UnprocessableEntity(`"userType" header field is not valid (${Doctor.modelName}, ${Patient.modelName})`));
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
                if (!user.isEmailVerified && !user.isPhoneVerified) {
                    if (user.email) {
                        return next(new Forbidden("Please verify your email to use the app"))
                    } else {
                        return next(new Forbidden("Please verify your phone to use the app"));
                    }
                }
            }

            req.logIn(user, function (err) {
                if (err) return next(err);

                req.user = user;
                req.token = token;
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

exports.authWithoutVerification = (req, res, next) => {
    return auth(req, res, next, true);
};
