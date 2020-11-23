const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');

// mongoose.set('debug', isDevelopmentEnv);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose
    .connect(config.get('DB_URL'), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoCreate: true
    })
    .then(() => {

        winston.info('[+] mongoose connected');

    }, (err) => {
        winston.error('mongoose initial error' + err.message, err);
    });
