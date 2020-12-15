const passport = require('passport');
const {ResError} = require('./../../utils/error');
const {Doctor} = require('./../../models/CmsUser');

exports.login = async (req, res, next) => {

    passport.authenticate('local', (err,user,info) => {

        if(err) return next(err);

        if(!user) return next(new ResError('Invalid login credentials', 422));

        // Disable Doctor login temporarily
        if (user.type === Doctor.modelName) return next(new ResError('Invalid login credentials', 422));
        
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
