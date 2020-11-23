const session = require('express-session');
const config = require('config');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

module.exports = (app) => {

    app.use(cookieParser());

    app.use(session({
        secret: config.get('COOKIE_SECRET'),
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        })
    }));

};
