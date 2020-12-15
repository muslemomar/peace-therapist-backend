const passport = require('passport');
const {ResError} = require('./../../utils/error');

exports.login = async (req, res, next) => {

    passport.authenticate('local', (err,user,info) => {

        if(err) return next(err);

        if(!user) return next(new ResError('Invalid login credentials', 422));

        req.logIn(user, (err) => {
            if(err) return next(err);
            res.sendData(user);
        });

    })(req,res,next);

};

exports.logout = async (req,res,next) => {
    req.logout();
    res.send();
};
