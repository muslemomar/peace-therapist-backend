module.exports = (app) => {
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const config = require('config');
    const passportJWT = require("passport-jwt");
    const JwtStrategy = passportJWT.Strategy;
    const ExtractJwt = passportJWT.ExtractJwt;
    const mongoose = require('mongoose');

    const {CmsUser} = require('../models/CmsUser');
    const {User} = require('../models/User');

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {

        const model = user.constructor.modelName;

        if (user.constructor.modelName === User.modelName)
            return done(null, {user: user, model: model});

        done(null, {userId: user._id, model: model});
    });

    passport.deserializeUser(function (obj, done) {

        if (obj.model === User.modelName) return done(null, obj.user);

        mongoose.model(obj.model)
            .findById(obj.userId)
            .exec((err, user) => {

                if (err) return done(err, null);

                done(null, user);
            });

    });

    /*********************/
    /** JWT Strategy **/
    /*********************/

    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromHeader("authorization");
    opts.secretOrKey = config.get('JWT_SECRET');

    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {

        User.findById(jwt_payload._id)
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
