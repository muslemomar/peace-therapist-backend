const flash = require('connect-flash');

module.exports = (app) => {

    app.use(flash());

    app.use((req, res, next) => {

        res.locals.messages = require('express-messages')(req, res);
        next();
    });

};
