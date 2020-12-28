const {UserSession} = require('../models/UserSession');

module.exports = {
    async logoutUser(req) {
        await UserSession.deleteOne({token: req.token});
        req.logout();
    }
};