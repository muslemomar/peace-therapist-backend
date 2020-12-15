const passport = require('passport');
const {User, UserSession} = require('../models/User');
const {Admin, Doctor} = require('../models/CmsUser');
const {genRes} = require('./../utils/general');
const {ResError, Forbidden} = require('./../utils/error');
const {t} = require('localizify');

exports.adminAuth = (req, res, next) => {

    if (!req.isAuthenticated()) {
        res.status(401).send()
    } else {

        req.user = req.user.toJSON();
        req.user.isAdmin = req.user.type === Admin.modelName;
        req.user.isDoctor = req.user.type === Doctor.modelName;

        next();
    }
};

const auth = (req, res, next, passWithoutVerification) => {
    const token = req.headers.authorization;

    passport.authenticate('jwt', {session: false}, function (err, user, info) {
        if (err) return next(err);

        if (!user) {
            return next(new ResError(undefined, 401));
        }

        UserSession.findOne({
            user: user._id,
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
