module.exports = (app) => {
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const config = require('config');
    const passportJWT = require("passport-jwt");
    const JwtStrategy = passportJWT.Strategy;
    const ExtractJwt = passportJWT.ExtractJwt;
    const mongoose = require('mongoose');

    const {CmsUser} = require('../models/CmsUser');
    const {Patient} = require('../models/Patient');
    const {Doctor} = require('../models/Doctor');

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    /*********************/
    /** JWT Strategy **/
    /*********************/

    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromHeader("authorization");
    opts.secretOrKey = config.get('JWT_SECRET');
    opts.passReqToCallback = true;

    passport.use(new JwtStrategy(opts, function (req, jwt_payload, done) {

        mongoose.model(req.userType).findById(jwt_payload._id)
            .then((user) => {
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            }).catch((e) => {
            return done(e, false);
        });

    }));

    /*********************/
    /** Local Strategy **/
    /*********************/

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        session: false
    }, function (username, password, done) {

        CmsUser.findByCredentials(username, password).then((user) => {
            if (!user) {
                return done(null, false, {message: 'Please correct your login details!', type: 'danger'});
            }
            return done(null, user);
        }).catch((e) => {
            return done(e);
        });

    }));

};
